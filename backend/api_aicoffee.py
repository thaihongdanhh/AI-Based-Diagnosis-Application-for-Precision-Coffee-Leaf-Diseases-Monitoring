from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Response
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse, UJSONResponse, FileResponse
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from pydantic import BaseModel

import pandas as pd
import logging
import time
from time import gmtime, strftime,localtime
from datetime import datetime, timedelta
import requests
from pymongo import MongoClient

from skimage. filters import threshold_local
import numpy as np
import cv2
import imutils


import uvicorn
import bcrypt
import time
import jwt
import pytz
from pytz import timezone
from pathlib import Path
import base64
import os

import torch.backends.cudnn as cudnn

from yolov5.models.experimental import *
from yolov5.utils.datasets import *
import yolov5.utils.torch_utils as torch_utils
import yolov5.utils.google_utils as google_utils
from yolov5.utils.general import *

from yolov5.cfdetection import load_yolov5_model, get_bounding_boxes
from weightlib.processdata import process_img, crop_seperated_cf
from tensorflow.keras.models import load_model
import pickle

# import run from './detectA4.py'

client = MongoClient("")

db_coffee = client.coffee
users = db_coffee.users
images = db_coffee.images
edit_historys = db_coffee.edit_historys

app = FastAPI()

origins = [            
    "*"
]
# app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def order_coordinates(pts):
    rectangle = np.zeros((4, 2), dtype = "float32")
    s = pts.sum(axis = 1)
    rectangle[0] = pts[np.argmin(s)]
    rectangle[2] = pts[np.argmax(s)]
    difference = np.diff(pts, axis = 1)
    rectangle[1] = pts[np.argmin(difference)]
    rectangle[3] = pts[np.argmax(difference)]
    return rectangle

def point_transform(image, pts):
    rect = order_coordinates(pts)
    (upper_left, upper_right, bottom_right, bottom_left) = rect
    width1 = np.sqrt(((bottom_right[0] - bottom_left[0]) ** 2) + ((bottom_right[1] - bottom_left[1]) ** 2))
    width2 = np.sqrt(((upper_right[0] - upper_left[0]) ** 2) +((upper_right[1] - upper_left[1]) ** 2))
    Width = max(int(width1), int(width2)) #considers maximum width value as Width
    height1 = np.sqrt(((upper_right[0] - bottom_right[0]) ** 2) +((upper_right[1] - bottom_right[1]) ** 2))
    height2 = np.sqrt(((upper_left[0] - bottom_left[0]) ** 2) + ((upper_left[1] - bottom_left[1]) ** 2))
    Height = max(int(height1), int(height2)) #considers maximum height value as Height
    distance = np.array([[0, 0],[Width - 1, 0],[Width - 1, Height - 1],[0,Height - 1]], dtype ="float32")
    Matrix = cv2.getPerspectiveTransform(rect, distance) 
    warped_image = cv2.warpPerspective(image, Matrix, (Width, Height))
    return warped_image

@app.get('/coffee/phone/check')
def check_phone(
    phone: str
):

    df_check = pd.DataFrame(users.find({'username': phone}))

    if df_check.empty:
        response_json = {"username": "not_exists"}
    else:
        response_json = {"username": df_check['username'].values[0]}

    return response_json

class CoffeeRegister(BaseModel):
    username: str
    fullname: str
    fingerprint: str    

@app.post('/coffee/register')
def api_register(
    CoffeeRegister: CoffeeRegister
):
    # data = request.get_json() 
    # print(data)        
    # username = data['username']
    # fullname = data['fullname']    
    # fingerprint = data['fingerprint']

    # print(userpw)
    username = CoffeeRegister.dict()['username']
    fullname = CoffeeRegister.dict()['fullname']
    fingerprint = CoffeeRegister.dict()['fingerprint']    

    df_users = pd.DataFrame(users.find({'username': username}))
    if(df_users.empty == False):
        raise HTTPException(status_code=400, detail={"error": "SĐT đã tồn tại"})

    else:           

        salt = bcrypt.gensalt()
        # hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

        df_users = pd.DataFrame([{
            'username': username,
            'fullname': fullname
            # 'password': hashed.decode('utf-8')
            }])
        users.insert_many(df_users.to_dict('records'))

        raise HTTPException(status_code=200, detail={"status": "success", "username": username})

@app.post('/coffee/login')
def api_coffee_login(
    username: str = Form(...),
    password: str = Form(...),
    fingerprint: str = Form(...),
):    

    df_user = pd.DataFrame(users.find({'username': username}))

    tz = timezone('Asia/Ho_chi_Minh')
    loc_dt = tz.localize(datetime.now())
    created_date = loc_dt.strftime("%Y-%m-%d %H:%M:%S")
    snapshot_date = loc_dt.strftime("%Y-%m-%d")

    if (df_user.empty == True):        
        data = ({
            'message': "Tài khoản không đúng hoặc đã vô hiệu hóa"
        })

        raise HTTPException(status_code=404, detail={"username": "Tài khoản không đúng hoặc đã vô hiệu hóa"})
    
    else:
        
        salt = bcrypt.gensalt()
        hashed = df_user['password'][0]

        if bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8')):
            df_users = pd.DataFrame(users.find({'username': username,'password': password}))
            key = 'secretkey' + fingerprint
            
            payload = {
                'username': username,
                'iat': time.time()
            }

            df_edit_historys = pd.DataFrame([
                {
                    'edit_by': username,
                    'edt_table': 'login',
                    'edit_with': username,
                    'type': 'login',
                    'sql_query': '/coffee/login',
                    'created_date': created_date,
                    'snapshot_date': snapshot_date
                }
            ])
            
            
            edit_history.insert_many(df_edit_historys.to_dict('records'))
            # print(payload)

            token = jwt.encode(payload, key, algorithm='HS256')

            data = ({
                'message': 'Success',
                'company':'TNC',
                'token': token
            })

            raise HTTPException(status_code=200, detail={
                'message': 'Success',
                'company': 'TNC',
                'token': token
            })
           
        else:
            data = ({
                'message': 'Mật khẩu không đúng'
            })
            raise HTTPException(status_code=400, detail={'password': 'Mật khẩu không đúng'})

@app.get('/user/login')
def api_login(
    username: str,
    password: str,
    fingerprint: str):

    tz = timezone('Asia/Ho_chi_Minh')
    loc_dt = tz.localize(datetime.now())
    created_date = loc_dt.strftime("%Y-%m-%d %H:%M:%S")
    snapshot_date = loc_dt.strftime("%Y-%m-%d")

    sql = """
    select * from users
    where username = '%s'
    and is_deleted = 0
    """% (username)

    df_user = pd.read_sql(sql,conn)

    if (df_user.empty == True):
        data = ({
            'message': "Tài khoản không đúng hoặc đã vô hiệu hóa"
        })

        raise HTTPException(status_code=404, detail={"username": "Tài khoản không đúng hoặc đã vô hiệu hóa"})

    else:

        salt = bcrypt.gensalt()
        hashed = str(df_user['password'].values[0])

        if bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8')):
            sql = """
            select *
            from users
            where username = '%s'
            """% (username)

            df_users = pd.read_sql(sql,conn)

            # employee_code = df_users['username'].values[0]
            user_id = df_users['user_id'].values[0]
            username = df_users['username'].values[0]
            # email = df_users['email'].values[0]
            full_name = df_users['full_name'].values[0]
            phone = df_users['phone'].values[0]

            key = 'secretkey' + fingerprint
            payload = {
                'user_id': str(user_id),
                'username': str(username),
                'iat': time.time(),
                'full_name': str(full_name),
                'phone': str(phone)
            }

            #lưu lịch sử admin
            a = df_users.replace('\'','\'\'').replace(',','|').replace('\n','')
            sql_insert_log = """
            insert into edit_history (edit_by,edit_table,edit_with,type,sql_query,created_date,snapshot_date)
            values ('%s', '%s', '%s', '%s', '%s', '%s','%s')
            """% (username,'login',username,'login',a,created_date,snapshot_date)

            cursor.execute(sql_insert_log)
            conn.commit()

            # print(payload)

            token = jwt.encode(payload, key, algorithm='HS256')
            data = ({
                'message': 'Success',
                'company':'UEL',
                'token': token
            })

            raise HTTPException(status_code=200, detail={
                'message': 'Success',
                'company': 'UEL',
                'token': token
            })

        else:
            data = ({
                'message': 'Mật khẩu không đúng'
            })
            raise HTTPException(status_code=400, detail={'password': 'Mật khẩu không đúng'})


def order_points(pts):
    '''Rearrange coordinates to order:
      top-left, top-right, bottom-right, bottom-left'''
    rect = np.zeros((4, 2), dtype='float32')
    pts = np.array(pts)
    s = pts.sum(axis=1)
    # Top-left point will have the smallest sum.
    rect[0] = pts[np.argmin(s)]
    # Bottom-right point will have the largest sum.
    rect[2] = pts[np.argmax(s)]

    diff = np.diff(pts, axis=1)
    # Top-right point will have the smallest difference.
    rect[1] = pts[np.argmin(diff)]
    # Bottom-left will have the largest difference.
    rect[3] = pts[np.argmax(diff)]
    # return the ordered coordinates
    return rect.astype('int').tolist()

def find_dest(pts):
    (tl, tr, br, bl) = pts
    # Finding the maximum width.
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))

    # Finding the maximum height.
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))
    # Final destination co-ordinates.
    destination_corners = [[0, 0], [maxWidth, 0], [maxWidth, maxHeight], [0, maxHeight]]

    return order_points(destination_corners)

def scan(img_path):
    # Resize image to workable size
    dim_limit = 1920    
    img = cv2.imread(img_path, 1)    
    max_dim = max(img.shape)
    if max_dim > dim_limit:
        resize_scale = dim_limit / max_dim
        img = cv2.resize(img, None, fx=resize_scale, fy=resize_scale)
    # Create a copy of resized original image for later use
    orig_img = img.copy()
    # Repeated Closing operation to remove text from the document.
    kernel = np.ones((5, 5), np.uint8)
    img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel, iterations=3)
    # GrabCut
    mask = np.zeros(img.shape[:2], np.uint8)
    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)
    rect = (20, 20, img.shape[1] - 20, img.shape[0] - 20)
    cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)
    mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
    img = img * mask2[:, :, np.newaxis]

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (11, 11), 0)
    # Edge Detection.
    canny = cv2.Canny(gray, 0, 200)
    canny = cv2.dilate(canny, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))

    # Finding contours for the detected edges.
    contours, hierarchy = cv2.findContours(canny, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    # Keeping only the largest detected contour.
    page = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    # Detecting Edges through Contour approximation.
    # Loop over the contours.
    if len(page) == 0:
        return orig_img
    for c in page:
        # Approximate the contour.
        epsilon = 0.02 * cv2.arcLength(c, True)
        corners = cv2.approxPolyDP(c, epsilon, True)
        # If our approximated contour has four points.
        if len(corners) == 4:
            break
    # Sorting the corners and converting them to desired shape.
    corners = sorted(np.concatenate(corners).tolist())
    # For 4 corner points being detected.
    corners = order_points(corners)

    destination_corners = find_dest(corners)

    h, w = orig_img.shape[:2]
    # Getting the homography.
    M = cv2.getPerspectiveTransform(np.float32(corners), np.float32(destination_corners))
    # Perspective transform using homography.
    final = cv2.warpPerspective(orig_img, M, (destination_corners[2][0], destination_corners[2][1]),
                                flags=cv2.INTER_LINEAR)
    return final


class CoffeeCrop(BaseModel):
    file: str
    deviceid: str  
    username: str
    filename: str

@app.post("/coffee/crop")
def crop_file(
    CoffeeCrop: CoffeeCrop
    ):

    try:
        file = CoffeeCrop.dict()['file']
        filename = CoffeeCrop.dict()['filename']
        username = CoffeeCrop.dict()['username']
        deviceid = CoffeeCrop.dict()['deviceid'].replace('+','').replace(' ','_').replace("'","")        

        filePath = "uploads/capture/"+ str(username) + '/' + str(deviceid) + '/' + filename     
        file_path_cropped = "uploads/crop/"+ str(username) + '/' + str(deviceid) + '/' + 'crop_' + filename    

        Path("uploads/capture/"+ str(username) + '/' + str(deviceid)).mkdir(parents=True, exist_ok=True)
        Path("uploads/crop/"+ str(username) + '/' + str(deviceid)).mkdir(parents=True, exist_ok=True)
        with open(filePath, "wb") as buffer:
            # shutil.copyfileobj(file.file,buffer)
            buffer.write(base64.decodebytes(file.encode('utf8')))
        
        
        image = scan(filePath)
        cv2.imwrite(file_path_cropped, image)
        
        retval, buffer = cv2.imencode('.jpg', image)
        jpg_as_text = base64.b64encode(buffer)
        capturedUri = 'http://aistar.gbsmarter.com:5004/coffee/image?path=' + file_path_cropped
        return {"status": "success", "base64": jpg_as_text, "capturedUri": capturedUri, 'file_path': filePath, 'file_path_cropped': file_path_cropped }
        # raise HTTPException(status_code=200, detail={"status": "success"})

    except Exception as e:
        print('error', e)
        return {"status": "error"}
        # raise HTTPException(status_code=400, detail={"status": "error"})

@app.get("/coffee/image")
def fetch_image(
    path: str
    ):
    
    image_file = open(path,mode="rb")    
    print(path)
    return StreamingResponse(image_file, media_type="image/jpg")

class CoffeeItem(BaseModel):
    filename: str
    username: str
    deviceid: str
    file_path: str
    file_path_cropped: str

@app.post("/coffee/upload")
def upload_file(
    CoffeeItem: CoffeeItem
    ):

    # print(CoffeeItem)
    # print(CoffeeItem.dict())    
    filename = CoffeeItem.dict()['filename']
    username = CoffeeItem.dict()['username']
    deviceid = CoffeeItem.dict()['deviceid'].replace('+','').replace(' ','_').replace("'","")        
    file_path = CoffeeItem.dict()['file_path']
    file_path_cropped = CoffeeItem.dict()['file_path_cropped']

    tz = timezone('Asia/Ho_chi_Minh')
    loc_dt = tz.localize(datetime.now())
    created_date = loc_dt.strftime("%Y-%m-%d %H:%M:%S")
    start_time = datetime.now()    
    
    unix_time_now = int(time.time())
    # print(username,type_name)
    response_json = ""        

    os.rename(file_path, file_path.split(file_path.split('/')[-1])[0] + filename )
    os.rename(file_path_cropped, file_path_cropped.split(file_path_cropped.split('/')[-1])[0] + filename )
    
    df_coffee_images = pd.DataFrame([{
            'file_path': file_path.split(file_path.split('/')[-1])[0] + filename,
            'file_path_cropped': file_path_cropped.split(file_path_cropped.split('/')[-1])[0] + filename
        }])

    time_start = time.time()
    
    time_end = time.time()
    duration = time_end - time_start
    # df_coffee_images['duration'] = duration    
                
    last_hours = datetime.now()
    created_date = last_hours.strftime("%Y-%m-%d %H:%M:%S")   
    df_coffee_images['image_name'] = filename
    df_coffee_images['duration'] = duration
    df_coffee_images['username'] = username
    df_coffee_images['deviceid'] = deviceid
    df_coffee_images['created_date'] = created_date


    
    images.insert_many(df_coffee_images.to_dict('records'))
    response_json = {'data': df_coffee_images.to_dict('records')}

    return response_json


pathmodel_dict = {'BLACK':['./weightlib/model/BLACK/black','BLACK_maxSize.sav',0.01, 0.28]
                            ,'BROKEN': ['./weightlib/model/BROKEN/broken', 'BROKEN_maxSize.sav',0.02, 0.23] 
                            , 'BROWN': ['./weightlib/model/BROWN/brown',  'BROWN_maxSize.sav',0.08, 0.25]
                            , 'BigBroken': ['./weightlib/model/BigBroken/bigbroken','BigBroken_maxSize.sav',0.01, 0.18]
                            , 'CHERRY': ['./weightlib/model/CHERRY/cherry','CHERRY_maxSize.sav',0.03, 0.58]
                            , 'GOOD': ['./weightlib/model/GOOD/good','GOOD_maxSize.sav',0.02, 0.3 ]
                            , 'HEAVYFM': ['./weightlib/model/HEAVYFM/heavyfm','HEAVYFM_maxSize.sav',0.01, 0.6]
                            , 'IMMATURE': ['./weightlib/model/IMMATURE/immature','IMMATURE_maxSize.sav', 0.01, 0.2]
                            , 'INSECT': ['./weightlib/model/INSECT/insect','INSECT_maxSize.sav',0.02, 0.29]
                            , 'LIGHTFM': ['./weightlib/model/LIGHTFM/lightfm','LIGHTFM_maxSize.sav',0.017, 0.25]
                            , 'MOLD': ['./weightlib/model/MOLD/mold','MOLD_maxSize.sav',0.02, 0.24]
                            , 'PartlyBlack': ['./weightlib/model/PartlyBlack/partlyblack','PartlyBlack_maxSize.sav',0.03, 0.26]}

model_weight_black = load_model(pathmodel_dict['BLACK'][0])
model_weight_broken = load_model(pathmodel_dict['BROKEN'][0])
model_weight_brown = load_model(pathmodel_dict['BROWN'][0])
model_weight_bigbroken = load_model(pathmodel_dict['BigBroken'][0])
model_weight_cherry = load_model(pathmodel_dict['CHERRY'][0])
model_weight_good = load_model(pathmodel_dict['GOOD'][0])
model_weight_heavyfm = load_model(pathmodel_dict['HEAVYFM'][0])
model_weight_immature = load_model(pathmodel_dict['IMMATURE'][0])
model_weight_insect = load_model(pathmodel_dict['INSECT'][0])
model_weight_lightfm = load_model(pathmodel_dict['LIGHTFM'][0])
model_weight_mold = load_model(pathmodel_dict['MOLD'][0])
model_weight_partlyblack = load_model(pathmodel_dict['PartlyBlack'][0])

reality_dict = {'BLACK': 0, 'BROKEN': 0, 'BROWN': 0, 'BigBroken': 0
                , 'IMMATURE': 0, 'INSECT': 0, 'MOLD': 0
                , 'PartlyBlack': 0, 'FM': 0}                

class AI(object):
    def __init__(self,model,device):
        self.model = model
        self.device = device 

    def main(self, path, conf, iou_thres, save_path, start_time):
        #path = "./BROWN_111325.jpg"
        # file_list = os.listdir(path)
        # file_list = [path]
        # for file in file_list:
            # img_path = os.path.join(path, file)
        img_path = path
        img_array = cv2.imread(img_path ,cv2.IMREAD_COLOR)
        
        # in this example, we imagine that the image is A4 paper
        A4_width = img_array.shape[0]
        A4_height = img_array.shape[1]
        
        # label_dict = {'BLACK': [], 'BROKEN': [], 'BROWN': [], 'BigBroken': []
        #                 , 'CHERRY': [], 'GOOD': [], 'HEAVYFM': [], 'IMMATURE': []
        #                 , 'INSECT': [], 'LIGHTFM': [], 'MOLD': [], 'PartlyBlack': []}

        label_dict = {'BLACK': [], 'BROKEN': [], 'BROWN': [], 'BigBroken': []
                        , 'CHERRY': [], 'HEAVYFM': [], 'IMMATURE': []
                        , 'INSECT': [], 'LIGHTFM': [], 'MOLD': [], 'PartlyBlack': []}
        
        # result_dict contain predicted weights, intend for debugging
        # result_dict = {'BLACK': [], 'BROKEN': [], 'BROWN': [], 'BigBroken': []
        #                 , 'CHERRY': [], 'GOOD': [], 'HEAVYFM': [], 'IMMATURE': []
        #                 , 'INSECT': [], 'LIGHTFM': [], 'MOLD': [], 'PartlyBlack': []}

        result_dict = {'BLACK': [], 'BROKEN': [], 'BROWN': [], 'BigBroken': []
                        , 'CHERRY': [], 'HEAVYFM': [], 'IMMATURE': []
                        , 'INSECT': [], 'LIGHTFM': [], 'MOLD': [], 'PartlyBlack': []}
        
        #sumweight_dict contain total weight
        # sumweight_dict = {'BLACK': 0, 'BROKEN': 0, 'BROWN': 0, 'BigBroken': 0
        #                 , 'CHERRY': 0, 'GOOD': 0, 'HEAVYFM': 0, 'IMMATURE': 0
        #                 , 'INSECT': 0, 'LIGHTFM': 0, 'MOLD': 0, 'PartlyBlack': 0}

        sumweight_dict = {'BLACK': 0, 'BROKEN': 0, 'BROWN': 0, 'BigBroken': 0
                        , 'CHERRY': 0, 'HEAVYFM': 0, 'IMMATURE': 0
                        , 'INSECT': 0, 'LIGHTFM': 0, 'MOLD': 0, 'PartlyBlack': 0}
        

        
        # pathmodel_dict = {'BLACK':['./weightlib/model/BLACK/black','BLACK_maxSize.sav',0.01, 0.28]
        #                     ,'BROKEN': ['./weightlib/model/BROKEN/broken', 'BROKEN_maxSize.sav',0.02, 0.23] 
        #                     , 'BROWN': ['./weightlib/model/BROWN/brown',  'BROWN_maxSize.sav',0.08, 0.25]
        #                     , 'BigBroken': ['./weightlib/model/BigBroken/bigbroken','BigBroken_maxSize.sav',0.01, 0.18]
        #                     , 'CHERRY': ['./weightlib/model/CHERRY/cherry','CHERRY_maxSize.sav',0.03, 0.58]
        #                     , 'GOOD': ['./weightlib/model/GOOD/good','GOOD_maxSize.sav',0.02, 0.3 ]
        #                     , 'HEAVYFM': ['./weightlib/model/HEAVYFM/heavyfm','HEAVYFM_maxSize.sav',0.01, 0.6]
        #                     , 'IMMATURE': ['./weightlib/model/IMMATURE/immature','IMMATURE_maxSize.sav', 0.01, 0.2]
        #                     , 'INSECT': ['./weightlib/model/INSECT/insect','INSECT_maxSize.sav',0.02, 0.29]
        #                     , 'LIGHTFM': ['./weightlib/model/LIGHTFM/lightfm','LIGHTFM_maxSize.sav',0.017, 0.25]
        #                     , 'MOLD': ['./weightlib/model/MOLD/mold','MOLD_maxSize.sav',0.02, 0.24]
        #                     , 'PartlyBlack': ['./weightlib/model/PartlyBlack/partlyblack','PartlyBlack_maxSize.sav',0.03, 0.26]}


        pathmodel_dict = {'BLACK':['./weightlib/model/BLACK/black', 14.823703269458589, 0.01, 0.28]
                          ,'BROKEN': ['./weightlib/model/BROKEN/broken', 18.09523422796036,0.02, 0.23] 
                          , 'BROWN': ['./weightlib/model/BROWN/brown',14.28546656507206,0.08, 0.25]
                          , 'BigBroken': ['./weightlib/model/BigBroken/bigbroken',18.031747910640263,0.01, 0.18]
                          , 'CHERRY': ['./weightlib/model/CHERRY/cherry',28.040057805345374,0.03, 0.58]
                          , 'GOOD': ['./weightlib/model/GOOD/good',1,0.02, 0.3 ]
                          , 'HEAVYFM': ['./weightlib/model/HEAVYFM/heavyfm',16.04708845399877,0.01, 0.6]
                          , 'IMMATURE': ['./weightlib/model/IMMATURE/immature',11.90503043700348, 0.01, 0.2]
                          , 'INSECT': ['./weightlib/model/INSECT/insect',20.13278202775593,0.02, 0.29]
                          , 'LIGHTFM': ['./weightlib/model/LIGHTFM/lightfm',138.47154210153172,0.017, 0.25]
                          , 'MOLD': ['./weightlib/model/MOLD/mold',15.480108617079226,0.02, 0.24]
                          , 'PartlyBlack': ['./weightlib/model/PartlyBlack/partlyblack',18.75625033739805,0.03, 0.26]}
                            

        end_time = datetime.now()
        print('Total Load Dict: ' + str((end_time - start_time).total_seconds()) )    
        boxes, counter = get_bounding_boxes(frame=img_array, model=self.model, device=self.device, save_path = save_path , conf = conf, iou_thres = iou_thres)

        end_time = datetime.now()
        print('Total Load Bounding Boxes: ' + str((end_time - start_time).total_seconds()) )
        for box in boxes:
            if box[5] in label_dict.keys():
                label_dict[box[5]].append(box)

        end_time = datetime.now()
        print('Total Appending Label Dict: ' + str((end_time - start_time).total_seconds()) )
        for key , boxlist in label_dict.items():
            if key != 'GOOD': # cannot estimate weight for good cafe        
                if len(boxlist) !=0: # check
                    #load model with label name
                    # model_weight = load_model(pathmodel_dict[key][0])
                    model_weight = ""

                    if key == 'BLACK':
                        model_weight = model_weight_black
                    elif key == 'BROKEN':
                        model_weight = model_weight_broken
                    elif key == 'BROWN':
                        model_weight = model_weight_brown
                    elif key == 'BigBroken':
                        model_weight = model_weight_bigbroken
                    elif key == 'CHERRY':
                        model_weight = model_weight_cherry
                    elif key == 'GOOD':
                        model_weight = model_weight_good
                    elif key == 'HEAVYFM':
                        model_weight = model_weight_heavyfm
                    elif key == 'IMMATURE':
                        model_weight = model_weight_immature
                    elif key == 'INSECT':
                        model_weight = model_weight_insect
                    elif key == 'LIGHTFM':
                        model_weight = model_weight_lightfm
                    elif key == 'MOLD':
                        model_weight = model_weight_mold                        
                    elif key == 'PartlyBlack':
                        model_weight = model_weight_partlyblack

                    end_time = datetime.now()
                    print('Total Load Model: ' + str((end_time - start_time).total_seconds()) )
                    #max_Weight_path = os.path.join(pathmodel_dict[key][0],pathmodel_dict[key][1])
                    # max_Size_path = os.path.join(pathmodel_dict[key][0],pathmodel_dict[key][1])
                    #max_Weight = pickle.load(open(max_Weight_path,'rb'))
                    # max_Size = pickle.load(open(max_Size_path,'rb'))
                    max_Size = pathmodel_dict[key][1]
                    minW = pathmodel_dict[key][2]
                    maxW = pathmodel_dict[key][3]
                    print(minW, maxW)
                    start_time_seed = datetime.now()
                    n_seed = 0
                    for seed in boxlist:
                        n_seed += 1
                        unique_box = crop_seperated_cf(img_array,seed[0],seed[1],seed[2],seed[3])
                        end_time = datetime.now()
                        print('Total Crop Seperated Time: ' + str(n_seed) + '. ' + str((end_time - start_time_seed).total_seconds()) )
                        norm_img, size = process_img(unique_box, A4_width, A4_height)
                        end_time = datetime.now()
                        print('Total Process Time: ' + str(n_seed) + '. ' + str((end_time - start_time_seed).total_seconds()) )
                        norm_size = 1 if abs(size/max_Size)>1 else abs(size/max_Size)
                        norm_size = np.array(norm_size).reshape(-1,1)
                        preds = model_weight.predict([norm_size,norm_img])
                        end_time = datetime.now()
                        print('Total Predict Time: ' + str(n_seed) + '. ' + str((end_time - start_time_seed).total_seconds()) )
                        real_weight = (abs(preds[0][0])-minW)*(maxW-minW) + minW
                        #print(preds,real_weight)
                        result_dict[key].append(real_weight)
                        sumweight_dict[key] = sumweight_dict[key] + real_weight
                        end_time = datetime.now()
                        print('Total Sum Weight Time: ' + str(n_seed) + '. ' + str((end_time - start_time_seed).total_seconds()) )
                    #print(sumweight_dict)
                    end_time = datetime.now()
                    print('Total Seed Time: ' + str((end_time - start_time).total_seconds()) )
                end_time = datetime.now()
                print('Total Load Label Dict: ' + str((end_time - start_time).total_seconds()) )

        end_time = datetime.now()
        print('Total Process Weight: ' + str((end_time - start_time).total_seconds()) )
        print('done')
        for k, total in reality_dict.items():
            if k == 'FM':
                reality_dict[k] = reality_dict[k] + sumweight_dict['HEAVYFM'] + sumweight_dict['LIGHTFM'] + sumweight_dict['CHERRY']/2
            elif k in reality_dict.keys():
                reality_dict[k]= reality_dict[k] + sumweight_dict[k]
        #print(reality_dict)      
        return reality_dict, counter

class CoffeeUpload(BaseModel):
    project_name: str
    device_id: str
    username: str
    file: str

model, device = load_yolov5_model()
@app.post("/coffee/uploadimages")
def api_upload_images(
    CoffeeUpload: CoffeeUpload
):        
    
    unix_time_now = int(time.time())
    project_name = CoffeeUpload.dict()['project_name']
    username = CoffeeUpload.dict()['username']
    device_id = CoffeeUpload.dict()['device_id']
    f = CoffeeUpload.dict()['file']
    
    # print(project_name,type_name)
    response_json = ""
    filePath = ""
    Path("uploads/images/" + str(project_name)).mkdir(parents=True, exist_ok=True)
    Path("uploads/images/" + str(project_name) + '/' + str(device_id)).mkdir(parents=True, exist_ok=True)

    Path("uploads/images_processed/" + str(project_name)).mkdir(parents=True, exist_ok=True)
    Path("uploads/images_processed/" + str(project_name) + '/' + str(device_id)).mkdir(parents=True, exist_ok=True)    

    file_name = str(unix_time_now) + '-' + secure_filename(f.filename)    
    filePath = "uploads/images/"+ str(project_name) + '/' + str(device_id) + '/' + file_name     
    filePathProcessed = "uploads/images_processed/"+ str(project_name) + '/' + str(device_id) + '/' + file_name    
    f.save(filePath)
    df_coffee_images = pd.DataFrame([{
            'file_path': filePath.replace('../',''),
            'file_name': filePath.split('/')[-1]
        }])

    time_start = time.time()
    
    time_end = time.time()
    duration = time_end - time_start
    # df_coffee_images['duration'] = duration
                
    last_hours = datetime.now() + timedelta(hours=7)
    created_date = last_hours.strftime("%Y-%m-%d %H:%M:%S")   
    # df_coffee_images['transcript'] = transcript
    df_coffee_images['label'] = "None"
    df_coffee_images['duration'] = duration
    df_coffee_images['engine'] = "YOLOV5"
    df_coffee_images['project_name'] = project_name
    df_coffee_images['device_id'] = device_id
    # df_coffee_images['%correct'] = -1            
    df_coffee_images['created_date'] = created_date
    df_coffee_images['file_path_processed'] = filePathProcessed

    source = filePath
    out = Path("uploads/images_processed/"+ str(project_name) + '/' + str(device_id))
    # out = './inference/output'
    if not out.exists():
        out.mkdir(parents=True)

    # save_path = str(Path(out) / Path(p).name)
    save_path = str(Path(out) / file_name) 
    print('Begin Processing ...' )       
    start_time = datetime.now()
    final_result, counter = AI(model, device).main(path= filePath, conf = 0.5, iou_thres = 0.5, save_path = save_path, start_time = start_time)
    end_time = datetime.now()
    print('Duration: ' + str((end_time - start_time).total_seconds()) )
    # print(final_result)
    result = str(counter).replace('{','').replace('}','').replace("'",'')
    result_weight = str(final_result).replace('{','').replace('}','').replace("'",'')
    df_coffee_images['result'] = result
    df_coffee_images['result_weight'] = result_weight  

    images.insert_many(df_coffee_images.to_dict('records'))
    response_json = jsonify({'data': df_coffee_images.to_dict('records')})          

    return response_json    

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5004,
        )    