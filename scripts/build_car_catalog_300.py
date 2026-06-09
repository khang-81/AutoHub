"""
Sinh car-catalog.json (150 model × 30 xe thuê + 30 xe bán / hãng) và SQL models.
Chạy: python scripts/build_car_catalog_300.py
Sau đó: node scripts/gen-car-seed.js && python docker/sqlserver-init/build_sync_demo_data.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_CATALOG = ROOT / "car-catalog.json"
OUT_MODELS_SQL = ROOT / "_generated_models.sql"

BRANDS_ORDER = ["Toyota", "Honda", "VinFast", "Mazda", "Mercedes-Benz"]

# Mỗi hãng: danh sách (tên đầy đủ, gallery_key, daily, sale, year, seats, trans, fuel, km_base)
# gallery_key trỏ tới GALLERIES — ảnh Wikimedia đã có trong catalog cũ + bổ sung
GALLERIES: dict[str, dict] = {
    "vf3": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VinFast_VF_3_IMG_7214.jpg/800px-VinFast_VF_3_IMG_7214.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg"},
        ],
    },
    "vf8": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg"},
        ],
    },
    "vf9": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg/800px-VinFast_VF_9_at_VinFast_Manufacturing_Plant.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/VinFast_VF9.jpg/800px-VinFast_VF9.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/VinFast_VF_9_front.jpg/800px-VinFast_VF_9_front.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VinFast_VF_9_interior.jpg/800px-VinFast_VF_9_interior.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VinFast_VF9_cabin.jpg/800px-VinFast_VF9_cabin.jpg"},
        ],
    },
    "camry": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_front_left_%28NY%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_left_%28NY%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_side_%28NY%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_interior.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg/800px-2018_Toyota_Camry_XLE_V6_in_Midnight_Black_Metallic%2C_rear_interior.jpg"},
        ],
    },
    "corolla_cross": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg/800px-2021_Toyota_Corolla_Cross_Hybrid_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2021_Toyota_Corolla_Cross_dashboard.jpg/800px-2021_Toyota_Corolla_Cross_dashboard.jpg"},
        ],
    },
    "fortuner": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2016_Toyota_Fortuner_%28front%29.jpg/800px-2016_Toyota_Fortuner_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2016_Toyota_Fortuner_%28rear%29.jpg/800px-2016_Toyota_Fortuner_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2016_Toyota_Fortuner_%28side%29.jpg/800px-2016_Toyota_Fortuner_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Toyota_Fortuner_%28interior%29.jpg/800px-2016_Toyota_Fortuner_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2016_Toyota_Fortuner_dashboard.jpg/800px-2016_Toyota_Fortuner_dashboard.jpg"},
        ],
    },
    "city": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2020_Honda_City_RS_%28front%29.jpg/800px-2020_Honda_City_RS_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2020_Honda_City_RS_%28rear%29.jpg/800px-2020_Honda_City_RS_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Honda_City_RS_%28side%29.jpg/800px-2020_Honda_City_RS_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Honda_City_RS_%28interior%29.jpg/800px-2020_Honda_City_RS_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2020_Honda_City_dashboard.jpg/800px-2020_Honda_City_dashboard.jpg"},
        ],
    },
    "civic": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Honda_Civic_FE_%28front%29.jpg/800px-2022_Honda_Civic_FE_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2022_Honda_Civic_FE_%28rear%29.jpg/800px-2022_Honda_Civic_FE_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/2022_Honda_Civic_FE_%28side%29.jpg/800px-2022_Honda_Civic_FE_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2022_Honda_Civic_FE_%28interior%29.jpg/800px-2022_Honda_Civic_FE_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2022_Honda_Civic_dashboard.jpg/800px-2022_Honda_Civic_dashboard.jpg"},
        ],
    },
    "crv": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2017_Honda_CR-V_%28front%29.jpg/800px-2017_Honda_CR-V_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2017_Honda_CR-V_%28rear%29.jpg/800px-2017_Honda_CR-V_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2017_Honda_CR-V_%28side%29.jpg/800px-2017_Honda_CR-V_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2017_Honda_CR-V_%28interior%29.jpg/800px-2017_Honda_CR-V_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Honda_CR-V_dashboard.jpg/800px-2017_Honda_CR-V_dashboard.jpg"},
        ],
    },
    "mazda3": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg"},
        ],
    },
    "cx5": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg"},
        ],
    },
    "bt50": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2012_Mazda_BT-50_%28front%29.jpg/800px-2012_Mazda_BT-50_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2012_Mazda_BT-50_%28rear%29.jpg/800px-2012_Mazda_BT-50_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2012_Mazda_BT-50_%28side%29.jpg/800px-2012_Mazda_BT-50_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2012_Mazda_BT-50_%28interior%29.jpg/800px-2012_Mazda_BT-50_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/2012_Mazda_BT-50_dashboard.jpg/800px-2012_Mazda_BT-50_dashboard.jpg"},
        ],
    },
    "c_class": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mercedes-Benz_W206_IMG_6743.jpg/800px-Mercedes-Benz_W206_IMG_6743.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_IMG_6744.jpg/800px-Mercedes-Benz_W206_IMG_6744.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mercedes-Benz_W206_IMG_6745.jpg/800px-Mercedes-Benz_W206_IMG_6745.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mercedes-Benz_W206_interior_IMG_6746.jpg/800px-Mercedes-Benz_W206_interior_IMG_6746.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mercedes-Benz_W206_cabin.jpg/800px-Mercedes-Benz_W206_cabin.jpg"},
        ],
    },
    "e_class": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg"},
        ],
    },
    "glc": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg"},
        ],
    },
}

# (full_name, gallery_key, daily, sale, year, seats, transmission, fuel)
BRAND_MODELS: dict[str, list[tuple]] = {
    "Toyota": [
        ("Camry 2.5Q", "camry", 1500000, 1050000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Camry 2.5G", "camry", 1450000, 1020000000, 2022, 5, "AUTO", "GASOLINE"),
        ("Camry Hybrid 2.5HEV", "camry", 1700000, 1180000000, 2024, 5, "AUTO", "HYBRID"),
        ("Corolla Cross 1.8V", "corolla_cross", 900000, 820000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Corolla Cross Hybrid", "corolla_cross", 1100000, 920000000, 2024, 5, "AUTO", "HYBRID"),
        ("Corolla Cross GR Sport", "corolla_cross", 1200000, 980000000, 2024, 5, "AUTO", "HYBRID"),
        ("Fortuner Legender 2.4AT", "fortuner", 1600000, 1150000000, 2023, 7, "AUTO", "DIESEL"),
        ("Fortuner 2.4G 4x2", "fortuner", 1400000, 1080000000, 2022, 7, "AUTO", "DIESEL"),
        ("Fortuner 2.7V 4x4", "fortuner", 1550000, 1120000000, 2023, 7, "AUTO", "GASOLINE"),
        ("Vios 1.5G CVT", "camry", 650000, 480000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Vios 1.5E CVT", "camry", 600000, 450000000, 2022, 5, "AUTO", "GASOLINE"),
        ("Innova Cross 2.0G", "fortuner", 1300000, 950000000, 2024, 7, "AUTO", "GASOLINE"),
        ("Innova Cross 2.0V", "fortuner", 1350000, 990000000, 2024, 7, "AUTO", "GASOLINE"),
        ("Hilux 2.4E 4x4", "fortuner", 1200000, 880000000, 2023, 5, "MANUAL", "DIESEL"),
        ("Hilux 2.8Legender", "fortuner", 1500000, 1150000000, 2024, 5, "AUTO", "DIESEL"),
        ("Yaris Cross 1.5G", "corolla_cross", 850000, 720000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Raize 1.0Turbo", "corolla_cross", 700000, 580000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Land Cruiser Prado 2.8", "fortuner", 2800000, 2450000000, 2023, 7, "AUTO", "DIESEL"),
        ("Alphard 2.5HEV Executive", "fortuner", 3500000, 4200000000, 2024, 7, "AUTO", "HYBRID"),
        ("Veloz Cross 1.5CVT", "corolla_cross", 950000, 780000000, 2023, 7, "AUTO", "GASOLINE"),
        ("Wigo 1.2G MT", "camry", 500000, 380000000, 2022, 5, "MANUAL", "GASOLINE"),
        ("Avanza Premio 1.5AT", "corolla_cross", 750000, 620000000, 2023, 7, "AUTO", "GASOLINE"),
        ("Rush 1.5S", "corolla_cross", 800000, 680000000, 2022, 7, "AUTO", "GASOLINE"),
        ("Camry 2.0G", "camry", 1400000, 980000000, 2022, 5, "AUTO", "GASOLINE"),
        ("Corolla Altis 1.8G", "camry", 850000, 750000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Fortuner TRD Sportivo", "fortuner", 1650000, 1180000000, 2024, 7, "AUTO", "DIESEL"),
        ("Innova Zenix 2.0HEV", "fortuner", 1450000, 1050000000, 2024, 7, "AUTO", "HYBRID"),
        ("Hilux GR Sport", "fortuner", 1600000, 1250000000, 2024, 5, "AUTO", "DIESEL"),
        ("Land Cruiser 300 VXR", "fortuner", 5000000, 6800000000, 2024, 7, "AUTO", "DIESEL"),
        ("Camry 2.5Q Luxury", "camry", 1550000, 1080000000, 2024, 5, "AUTO", "GASOLINE"),
    ],
    "Honda": [
        ("City RS 1.5Turbo", "city", 700000, 580000000, 2023, 5, "AUTO", "GASOLINE"),
        ("City G 1.5CVT", "city", 650000, 540000000, 2022, 5, "AUTO", "GASOLINE"),
        ("City L 1.5CVT", "city", 600000, 510000000, 2022, 5, "AUTO", "GASOLINE"),
        ("Civic RS Turbo", "civic", 950000, 780000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Civic Type R", "civic", 1800000, 1650000000, 2024, 5, "MANUAL", "GASOLINE"),
        ("Civic G 1.5Turbo", "civic", 900000, 750000000, 2023, 5, "AUTO", "GASOLINE"),
        ("CR-V L Turbo", "crv", 1200000, 980000000, 2023, 7, "AUTO", "GASOLINE"),
        ("CR-V G 1.5Turbo", "crv", 1100000, 920000000, 2022, 7, "AUTO", "GASOLINE"),
        ("CR-V RS e:HEV", "crv", 1350000, 1150000000, 2024, 7, "AUTO", "HYBRID"),
        ("Accord Turbo", "civic", 1400000, 1250000000, 2023, 5, "AUTO", "GASOLINE"),
        ("HR-V G 1.5L", "crv", 850000, 720000000, 2024, 5, "AUTO", "GASOLINE"),
        ("HR-V L 1.5L", "crv", 900000, 760000000, 2024, 5, "AUTO", "GASOLINE"),
        ("HR-V RS e:HEV", "crv", 1050000, 890000000, 2024, 5, "AUTO", "HYBRID"),
        ("BR-V G 1.5CVT", "crv", 800000, 680000000, 2023, 7, "AUTO", "GASOLINE"),
        ("BR-V L 1.5CVT", "crv", 850000, 720000000, 2023, 7, "AUTO", "GASOLINE"),
        ("Brio RS CVT", "city", 550000, 420000000, 2022, 5, "AUTO", "GASOLINE"),
        ("Brio G CVT", "city", 500000, 390000000, 2022, 5, "AUTO", "GASOLINE"),
        ("Odyssey 2.4L", "crv", 1600000, 1380000000, 2023, 7, "AUTO", "GASOLINE"),
        ("Civic E 1.5Turbo", "civic", 880000, 720000000, 2023, 5, "AUTO", "GASOLINE"),
        ("City Sport 1.5CVT", "city", 680000, 560000000, 2024, 5, "AUTO", "GASOLINE"),
        ("CR-V E 1.5Turbo", "crv", 1050000, 880000000, 2023, 7, "AUTO", "GASOLINE"),
        ("HR-V E 1.5L", "crv", 820000, 690000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Accord Hybrid", "civic", 1500000, 1350000000, 2024, 5, "AUTO", "HYBRID"),
        ("BR-V Prestige", "crv", 900000, 760000000, 2024, 7, "AUTO", "GASOLINE"),
        ("City Alpha 1.5CVT", "city", 720000, 600000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Civic RS e:HEV", "civic", 1050000, 920000000, 2024, 5, "AUTO", "HYBRID"),
        ("CR-V Sport 1.5Turbo", "crv", 1250000, 1020000000, 2024, 7, "AUTO", "GASOLINE"),
        ("HR-V Advance", "crv", 950000, 800000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Odyssey Elite", "crv", 1700000, 1450000000, 2024, 7, "AUTO", "GASOLINE"),
        ("City RS e:HEV", "city", 780000, 650000000, 2024, 5, "AUTO", "HYBRID"),
    ],
    "VinFast": [
        ("VF 3 Standard", "vf3", 650000, 280000000, 2024, 4, "AUTO", "ELECTRIC"),
        ("VF 3 Plus", "vf3", 700000, 295000000, 2024, 4, "AUTO", "ELECTRIC"),
        ("VF 5 Plus", "vf8", 900000, 520000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 5 Eco", "vf8", 850000, 480000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 6 Eco", "vf8", 1100000, 720000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 6 Plus", "vf8", 1200000, 780000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 7 Eco", "vf8", 1300000, 850000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 7 Plus", "vf8", 1400000, 920000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 8 Eco", "vf8", 1800000, 1050000000, 2023, 5, "AUTO", "ELECTRIC"),
        ("VF 8 Plus", "vf8", 1950000, 1120000000, 2023, 5, "AUTO", "ELECTRIC"),
        ("VF 9 Eco", "vf9", 2200000, 1550000000, 2023, 7, "AUTO", "ELECTRIC"),
        ("VF 9 Plus", "vf9", 2400000, 1680000000, 2024, 7, "AUTO", "ELECTRIC"),
        ("VF 8 City Edition", "vf8", 1750000, 1020000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 9 Captain Seat", "vf9", 2500000, 1720000000, 2024, 6, "AUTO", "ELECTRIC"),
        ("VF 3 City Pack", "vf3", 680000, 290000000, 2024, 4, "AUTO", "ELECTRIC"),
        ("VF 5 City Pack", "vf8", 880000, 500000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 6 City Pack", "vf8", 1150000, 750000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 7 City Pack", "vf8", 1350000, 880000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 8 Premium", "vf8", 2000000, 1150000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 9 Premium", "vf9", 2600000, 1750000000, 2024, 7, "AUTO", "ELECTRIC"),
        ("VF 3 Long Range", "vf3", 720000, 310000000, 2024, 4, "AUTO", "ELECTRIC"),
        ("VF 5 Long Range", "vf8", 920000, 540000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 6 Long Range", "vf8", 1250000, 800000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 7 Long Range", "vf8", 1450000, 950000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 8 Long Range", "vf8", 2100000, 1180000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 9 Long Range", "vf9", 2700000, 1780000000, 2024, 7, "AUTO", "ELECTRIC"),
        ("VF 8 Sport", "vf8", 2050000, 1160000000, 2024, 5, "AUTO", "ELECTRIC"),
        ("VF 9 Sport", "vf9", 2650000, 1760000000, 2024, 7, "AUTO", "ELECTRIC"),
        ("VF 3 Premium", "vf3", 750000, 320000000, 2024, 4, "AUTO", "ELECTRIC"),
        ("VF 8 Herio Green", "vf8", 1900000, 1100000000, 2024, 5, "AUTO", "ELECTRIC"),
    ],
    "Mazda": [
        ("Mazda3 1.5G Sport", "mazda3", 800000, 680000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Mazda3 2.0G Luxury", "mazda3", 900000, 750000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Mazda3 2.0G Premium", "mazda3", 950000, 780000000, 2024, 5, "AUTO", "GASOLINE"),
        ("CX-5 2.0G Luxury", "cx5", 1100000, 920000000, 2023, 5, "AUTO", "GASOLINE"),
        ("CX-5 2.5G Premium", "cx5", 1200000, 980000000, 2023, 5, "AUTO", "GASOLINE"),
        ("CX-5 2.0G Sport", "cx5", 1050000, 880000000, 2022, 5, "AUTO", "GASOLINE"),
        ("BT-50 Premium 4x4", "bt50", 850000, 720000000, 2023, 5, "AUTO", "DIESEL"),
        ("BT-50 GT 4x4", "bt50", 950000, 780000000, 2024, 5, "AUTO", "DIESEL"),
        ("BT-50 Sport 4x2", "bt50", 800000, 680000000, 2022, 5, "MANUAL", "DIESEL"),
        ("CX-3 1.5G Sport", "cx5", 750000, 620000000, 2022, 5, "AUTO", "GASOLINE"),
        ("CX-3 2.0G Luxury", "cx5", 820000, 680000000, 2023, 5, "AUTO", "GASOLINE"),
        ("CX-8 2.5G Luxury", "cx5", 1400000, 1150000000, 2023, 7, "AUTO", "GASOLINE"),
        ("CX-8 2.5G Premium", "cx5", 1500000, 1220000000, 2024, 7, "AUTO", "GASOLINE"),
        ("CX-30 2.0G Luxury", "cx5", 950000, 820000000, 2024, 5, "AUTO", "GASOLINE"),
        ("CX-30 2.0G Premium", "cx5", 1000000, 860000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Mazda6 2.0G Luxury", "mazda3", 1100000, 950000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Mazda6 2.5G Premium", "mazda3", 1200000, 1020000000, 2023, 5, "AUTO", "GASOLINE"),
        ("Mazda2 1.5G Sport", "mazda3", 650000, 520000000, 2022, 5, "AUTO", "GASOLINE"),
        ("Mazda2 1.5G Luxury", "mazda3", 700000, 560000000, 2023, 5, "AUTO", "GASOLINE"),
        ("CX-5 Signature", "cx5", 1250000, 1050000000, 2024, 5, "AUTO", "GASOLINE"),
        ("CX-5 Carbon Edition", "cx5", 1180000, 990000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Mazda3 Carbon Edition", "mazda3", 980000, 800000000, 2024, 5, "AUTO", "GASOLINE"),
        ("BT-50 Thunder", "bt50", 980000, 820000000, 2024, 5, "AUTO", "DIESEL"),
        ("CX-8 Signature", "cx5", 1550000, 1280000000, 2024, 7, "AUTO", "GASOLINE"),
        ("CX-30 Carbon", "cx5", 1020000, 880000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Mazda6 Signature", "mazda3", 1250000, 1080000000, 2024, 5, "AUTO", "GASOLINE"),
        ("CX-5 2.5T Turbo", "cx5", 1300000, 1100000000, 2024, 5, "AUTO", "GASOLINE"),
        ("Mazda3 2.0G Carbon", "mazda3", 920000, 760000000, 2024, 5, "AUTO", "GASOLINE"),
        ("BT-50 Limited", "bt50", 920000, 760000000, 2024, 5, "AUTO", "DIESEL"),
        ("CX-5 2.0G Exclusive", "cx5", 1120000, 940000000, 2024, 5, "AUTO", "GASOLINE"),
    ],
    "Mercedes-Benz": [
        ("C 200 Avantgarde", "c_class", 3500000, 1950000000, 2023, 5, "AUTO", "GASOLINE"),
        ("C 300 AMG Line", "c_class", 4000000, 2250000000, 2024, 5, "AUTO", "GASOLINE"),
        ("C 300 4MATIC", "c_class", 4200000, 2380000000, 2024, 5, "AUTO", "GASOLINE"),
        ("E 200 Exclusive", "e_class", 4500000, 2650000000, 2023, 5, "AUTO", "GASOLINE"),
        ("E 300 AMG Line", "e_class", 5000000, 2850000000, 2024, 5, "AUTO", "GASOLINE"),
        ("E 350 e AMG Line", "e_class", 5200000, 3100000000, 2024, 5, "AUTO", "HYBRID"),
        ("GLC 200 4MATIC", "glc", 3800000, 2150000000, 2023, 5, "AUTO", "GASOLINE"),
        ("GLC 300 4MATIC", "glc", 4200000, 2450000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLC 300 AMG Line", "glc", 4500000, 2580000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLC 300 Coupe 4MATIC", "glc", 4800000, 2720000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLB 200 AMG Line", "glc", 3600000, 2050000000, 2023, 5, "AUTO", "GASOLINE"),
        ("GLB 250 4MATIC", "glc", 3900000, 2180000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLE 450 4MATIC", "glc", 5500000, 3850000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLE 450 Coupe 4MATIC", "glc", 5800000, 4100000000, 2024, 5, "AUTO", "GASOLINE"),
        ("S 450 L", "e_class", 7000000, 5200000000, 2024, 5, "AUTO", "GASOLINE"),
        ("S 500 4MATIC", "e_class", 8000000, 6200000000, 2024, 5, "AUTO", "GASOLINE"),
        ("A 200 AMG Line", "c_class", 3200000, 1850000000, 2023, 5, "AUTO", "GASOLINE"),
        ("A 250 4MATIC", "c_class", 3400000, 1980000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLA 200 AMG Line", "glc", 3400000, 1920000000, 2023, 5, "AUTO", "GASOLINE"),
        ("GLA 250 4MATIC", "glc", 3700000, 2080000000, 2024, 5, "AUTO", "GASOLINE"),
        ("C 200 AMG Line", "c_class", 3700000, 2100000000, 2024, 5, "AUTO", "GASOLINE"),
        ("E 200 AMG Line", "e_class", 4600000, 2700000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLC 200 AMG Line", "glc", 4000000, 2280000000, 2024, 5, "AUTO", "GASOLINE"),
        ("GLE 300 d 4MATIC", "glc", 5200000, 3650000000, 2024, 5, "AUTO", "DIESEL"),
        ("GLS 450 4MATIC", "glc", 6500000, 4800000000, 2024, 7, "AUTO", "GASOLINE"),
        ("Maybach GLS 600", "glc", 12000000, 9800000000, 2024, 4, "AUTO", "GASOLINE"),
        ("C 300e AMG Line", "c_class", 4300000, 2420000000, 2024, 5, "AUTO", "HYBRID"),
        ("E 300e Exclusive", "e_class", 5100000, 2950000000, 2024, 5, "AUTO", "HYBRID"),
        ("GLC 300e 4MATIC", "glc", 4600000, 2620000000, 2024, 5, "AUTO", "HYBRID"),
        ("GLC 300 4MATIC AMG", "glc", 4400000, 2520000000, 2024, 5, "AUTO", "GASOLINE"),
    ],
}


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def build_catalog() -> list[dict]:
    catalog: list[dict] = []
    for brand in BRANDS_ORDER:
        models = BRAND_MODELS[brand]
        if len(models) != 30:
            raise SystemExit(f"{brand}: expected 30 models, got {len(models)}")
        for full_name, gkey, daily, sale, year, seats, trans, fuel in models:
            g = GALLERIES[gkey]
            catalog.append({
                "brand": brand,
                "model": full_name,
                "imageUrl": g["imageUrl"],
                "gallery": g["gallery"],
                "salePrice": sale,
                "dailyPrice": daily,
                "modelYear": year,
                "seats": seats,
                "transmission": trans,
                "fuelType": fuel,
            })
    return catalog


def build_models_sql(catalog: list[dict]) -> str:
    lines = ["/* Auto-generated models — 150 tên đầy đủ */"]
    seen: set[tuple[str, str]] = set()
    for entry in catalog:
        key = (entry["brand"], entry["model"])
        if key in seen:
            continue
        seen.add(key)
        b, m = sql_escape(entry["brand"]), sql_escape(entry["model"])
        lines.append(
            f"IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] "
            f"WHERE b.[name] = N'{b}' AND m.[name] = N'{m}')\n"
            f"    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])\n"
            f"    SELECT CAST(GETDATE() AS DATE), N'{m}', [id] FROM [dbo].[brands] WHERE [name] = N'{b}';"
        )
    lines.append("GO")
    return "\n".join(lines)


def main() -> None:
    catalog = build_catalog()
    OUT_CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_MODELS_SQL.write_text(build_models_sql(catalog), encoding="utf-8")
    print(f"Wrote {len(catalog)} catalog entries -> {OUT_CATALOG}")
    print(f"Wrote models SQL -> {OUT_MODELS_SQL}")


if __name__ == "__main__":
    main()
