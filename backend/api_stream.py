from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import uvicorn

from datetime import datetime
from ultralytics import YOLO
import cv2
from deep_sort_realtime.deepsort_tracker import DeepSort
from typing import Annotated
from fastapi import FastAPI, File, UploadFile, Form
import numpy as np
import base64
from collections import Counter
from colormap import rgb2hex

from pymongo import MongoClient
from pytz import timezone
import time
from time import gmtime, strftime,localtime

import pandas as pd

client = MongoClient("")

db_coffee = client.coffee
farms = db_coffee.farms
users = db_coffee.users
images = db_coffee.images
edit_historys = db_coffee.edit_historys


some_file_path = "1.mp4"
app = FastAPI()

origins = [       
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIDENCE_THRESHOLD = 0.5
GREEN = (0, 255, 0)
WHITE = (255, 255, 255)

np.random.seed(42)  # to get the same colors
colors = np.random.randint(0, 255, size=(10, 3))  # (80, 3)
color_ = {}
color__ = {}
# # load the pre-trained YOLOv8n model
# model = YOLO("yolov8n.pt")
tracker = DeepSort(max_age=50)  

CONFIDENCE_THRESHOLD = 0.5
GREEN = (0, 255, 0)
WHITE = (255, 255, 255)

# load the pre-trained YOLOv8n model
model = YOLO("best_leaf.pt")
model.to('cuda')
names = model.names

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


@app.post("/upload")
async def upload_image(    
    files: Annotated[
        list[UploadFile], File(description="Multiple files as UploadFile")
    ],
    ):    

    file_raw = []
    file_process = []
    image = []
    count = []
    for file in files:
        start = datetime.now()
        # contents = file.read()
        # nparr = np.fromstring(contents, np.uint8)
        file_path = 'uploads/' + 'raw-' + file.filename
        file_raw.append(file_path)
        with open(file_path,'wb+') as f:
            f.write(file.file.read())
            f.close()
        frame = cv2.imread(file_path, cv2.IMREAD_COLOR)              
        # frame = cv2.imread(file.read())
        detections = model(frame)[0]

        # initialize the list of bounding boxes and confidences
        results = []

        ######################################
        # DETECTION
        ######################################

        # loop over the detections
        for data in detections.boxes.data.tolist():
            # extract the confidence (i.e., probability) associated with the prediction
            confidence = data[4]

            # filter out weak detections by ensuring the 
            # confidence is greater than the minimum confidence
            if float(confidence) < CONFIDENCE_THRESHOLD:
                continue

            # if the confidence is greater than the minimum confidence,
            # get the bounding box and the class id
            xmin, ymin, xmax, ymax = int(data[0]), int(data[1]), int(data[2]), int(data[3])
            class_id = int(data[5])
            # add the bounding box (x, y, w, h), confidence and class id to the results list
            # results.append([[xmin, ymin, xmax - xmin, ymax - ymin], confidence, class_id])      
            count.append(str(names[int(class_id)]))        
            color = colors[class_id]                    
            B, G, R = int(color[0]), int(color[1]), int(color[2])
            color_[names[class_id]] = rgb2hex(R, G, B)      
            color__[names[class_id]] = (B, G, R)
            cv2.rectangle(frame, (xmin, ymin) , (xmax, ymax), (B, G, R), 2)
            cv2.putText(frame, str(names[int(class_id)]), (xmin + 5, ymin - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (B, G, R), 2)

        
        # end time to compute the fps
        end = datetime.now()
        # show the time it took to process 1 frame
        # print(f"Time to process 1 frame: {(end - start).total_seconds() * 1000:.0f} milliseconds")
        # calculate the frame per second and draw it on the frame
        # fps = f"FPS: {1 / (end - start).total_seconds():.2f}"
        # cv2.putText(frame, fps, (50, 50),
        #             cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 8)

        n = 1
        # for i in list(dict(Counter(count)).keys()):
        #     color = color__[i]                                
        #     cv2.putText(frame, i + ':' + str(dict(Counter(count))[i]), (15, 50 * n),
        #                 cv2.FONT_HERSHEY_SIMPLEX, 2, color, 8)
            
        #     n+=2

        for i in list(dict(Counter(count)).keys()):
            color = color__[i]                                
            cv2.putText(frame, i + ':' + str(dict(Counter(count))[i]), (15, 30 * n),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
            
            n+=1

        cv2.imwrite(file_path.replace('raw-',''), frame)
        file_process.append(file_path.replace('raw-',''))
        # retval, buffer_img = cv2.imencode('.jpg', frame)
        # frame = base64.b64encode(buffer_img)        
        image.append({'file_raw': file_path, 'file_process': file_path.replace('raw-',''), 'count': dict(Counter(count)), 'color': color_})
  

    return image


# class Diagnose(BaseModel):
#     farm_name: str
#     block_name: str
#     files: Annotated[
#         list[UploadFile], File(description="Multiple files as UploadFile")
#     ]

@app.post("/upload2")
async def upload_image2(
    farm_name: Annotated[str, Form()],
    block_name: Annotated[str, Form()],
    files: Annotated[
        list[UploadFile], File(description="Multiple files as UploadFile")
    ]
    ):    

    file_raw = []
    file_process = []
    image = []
    count = []

    tz = timezone('Asia/Ho_chi_Minh')
    loc_dt = tz.localize(datetime.now())
    created_date = loc_dt.strftime("%Y-%m-%d %H:%M:%S")
    created_date_format = loc_dt.strftime("%Y-%m-%d-%H-%M-%S")
    snapshot_date = loc_dt.strftime("%Y-%m-%d")

    # farm_name = Diagnose.dict()['farm_name']
    # block_name = Diagnose.dict()['block_name']
    # files = Diagnose.dict()['files']
    for file in files:
        start = datetime.now()
        # contents = file.read()
        # nparr = np.fromstring(contents, np.uint8)
        file_path = 'uploads/' + 'raw-' + created_date_format + '-' + file.filename
        file_raw.append(file_path)
        with open(file_path,'wb+') as f:
            f.write(file.file.read())
            f.close()
        frame = cv2.imread(file_path, cv2.IMREAD_COLOR)     
        # frame = cv2.flip(frame, 1)   
        # frame = cv2.imread(file.read())
        detections = model(frame)[0]

        # initialize the list of bounding boxes and confidences
        results = []

        ######################################
        # DETECTION
        ######################################

        # loop over the detections
        for data in detections.boxes.data.tolist():
            # extract the confidence (i.e., probability) associated with the prediction
            confidence = data[4]

            # filter out weak detections by ensuring the 
            # confidence is greater than the minimum confidence
            if float(confidence) < CONFIDENCE_THRESHOLD:
                continue

            # if the confidence is greater than the minimum confidence,
            # get the bounding box and the class id
            xmin, ymin, xmax, ymax = int(data[0]), int(data[1]), int(data[2]), int(data[3])
            class_id = int(data[5])
            # add the bounding box (x, y, w, h), confidence and class id to the results list
            # results.append([[xmin, ymin, xmax - xmin, ymax - ymin], confidence, class_id])      
            count.append(str(names[int(class_id)]))        
            color = colors[class_id]                    
            B, G, R = int(color[0]), int(color[1]), int(color[2])
            color_[names[class_id]] = rgb2hex(R, G, B)      
            color__[names[class_id]] = (B, G, R)
            cv2.rectangle(frame, (xmin, ymin) , (xmax, ymax), (B, G, R), 3)
            cv2.putText(frame, str(names[int(class_id)]), (xmin + 5, ymin - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (B, G, R), 2)

        
        # end time to compute the fps
        end = datetime.now()
        # show the time it took to process 1 frame
        # print(f"Time to process 1 frame: {(end - start).total_seconds() * 1000:.0f} milliseconds")
        # calculate the frame per second and draw it on the frame
        # fps = f"FPS: {1 / (end - start).total_seconds():.2f}"
        n = 1
        for i in list(dict(Counter(count)).keys()):
            color = color__[i]                                
            cv2.putText(frame, i + ':' + str(dict(Counter(count))[i]), (15, 40 * n),
                        cv2.FONT_HERSHEY_SIMPLEX, 2, color, 3)
            
            n+=1

        cv2.imwrite(file_path.replace('raw-',''), frame)
        file_process.append(file_path.replace('raw-',''))
        retval, buffer_img = cv2.imencode('.jpg', frame)
        frame = base64.b64encode(buffer_img)        
        image.append({'file_process': 'data:image/png;base64,' + frame.decode('utf8'), 'count': dict(Counter(count)), 'color': color_})
        status = 'Good'
        if len(count) > 0:
            status = 'Unhealthy'
        images.insert_many([{
            'file_path_process': file_path.replace('raw-',''), 
            'file_path_raw': file_path ,
            'status': status, 
            'count': dict(Counter(count)), 
            'color': color_, 
            'farm_name': farm_name, 
            'block_name':block_name, 
            'created_date': created_date}])


    return image

@app.get("/image")
def fetch_image(
    file_path: str):    
    image_file = open(file_path,mode="rb")
    # im_png = cv2.imdecode(resized, cv2.IMREAD_COLOR)
    # im_png = cv2.imencode(".png", resized)

    return StreamingResponse(image_file, media_type="image/jpg")

@app.get("/images/fetch")
def fetch_farm():
    # print(pd.DataFrame(farms.find()))
    df_image = pd.DataFrame(images.find())
    df_image = df_image.drop(columns=['_id'])
    df_image = df_image.fillna('')
    response = df_image.to_dict('records')
    return response

@app.get("/farm/fetch")
def fetch_farm():
    # print(pd.DataFrame(farms.find()))
    df_farm = pd.DataFrame(farms.find())
    df_farm = df_farm.drop(columns=['_id'])
    df_farm = df_farm.fillna('')
    response = df_farm.to_dict('records')
    return response

class FarmManagement(BaseModel):
    block_name: str
    block_area: str
    description: str
    location: str
    block_wealth: str

@app.post("/farm/add")
def add_farm(
    FarmManagement: FarmManagement
):
    farm_name = "FARM DT01"
    block_name =  FarmManagement.dict()['block_name']
    block_area =  FarmManagement.dict()['block_area']
    description = FarmManagement.dict()['description']
    location = FarmManagement.dict()['location']
    block_wealth = FarmManagement.dict()['block_wealth']

    tz = timezone('Asia/Ho_chi_Minh')
    loc_dt = tz.localize(datetime.now())
    created_date = loc_dt.strftime("%Y-%m-%d %H:%M:%S")
    snapshot_date = loc_dt.strftime("%Y-%m-%d")

    df_farm = pd.DataFrame([{
        'farm_name': farm_name,
        'block_name': block_name,
        'block_area': block_area,
        'description': description,
        'location': location,
        'block_wealth': block_wealth,
        'created_date': created_date
    }])

    farms.insert_many(df_farm.to_dict('records'))
    response_json = df_farm.to_dict('records')

    return response_json


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5004
        )