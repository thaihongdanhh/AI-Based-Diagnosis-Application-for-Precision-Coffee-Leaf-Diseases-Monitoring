# AI-Based-Diagnosis-Application-for-Precision-Coffee-Leaf-Diseases-Monitoring

This repository contains the code and labeled dataset for our research exploring deep-learning object detection models for the diagnosis of coffee leaf diseases application.

## Overview
Diseases can impact coffee yields directly. Smart agriculture is emerging as an effective solution to improve agricultural production. 
This paper explores an AI-based diagnostic application to monitor and detect diseases on coffee leaves accurately.

This project introduces a novel dataset and a suite of CNN models to assist in identifying and classifying coffee leaf diseases, including Phoma, Rust, Miner and Cercospora. The models tested include:

- YOLOv8
- YOLO11
- MobileNet
- ResNet50
- InceptionV3
- SVM

The research found that the YOLOv11s model performed best, achieving 83.9% mAP@0.5 with an inference speed of 1.8ms on an RTX 3080Ti GPU.

## Key Features
1. Dataset: 2000 images of coffee leaf disease.
2. Model Implementation: Includes implementations of YOLO-series (v5, v6, and v8), Faster-RCNN, RetinaNet, and SSD.
3. Performance Metrics: Evaluation based on mAP@0.5, model size, and inference time.
4. Application: The trained models are deployed into React Native FE and Python BE, FASTAPI.
