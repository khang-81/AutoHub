"""
Danh mục 35 xe thực tế (7 model × 5 hãng) — mỗi model có 1 bản thuê + 1 bản bán.
Chạy: python scripts/build_car_catalog_35.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_CATALOG = ROOT / "car-catalog.json"
OUT_MODELS_SQL = ROOT / "_generated_models.sql"

BRANDS_ORDER = ["Toyota", "Honda", "VinFast", "Mazda", "Mercedes-Benz"]

GALLERIES: dict[str, dict] = {
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
    "vios": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/2018_Toyota_Vios_%28front%29.jpg/800px-2018_Toyota_Vios_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2018_Toyota_Vios_%28rear%29.jpg/800px-2018_Toyota_Vios_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/2018_Toyota_Vios_%28side%29.jpg/800px-2018_Toyota_Vios_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2018_Toyota_Vios_%28interior%29.jpg/800px-2018_Toyota_Vios_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2018_Toyota_Vios_dashboard.jpg/800px-2018_Toyota_Vios_dashboard.jpg"},
        ],
    },
    "innova": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/2023_Toyota_Innova_Cross_%28front%29.jpg/800px-2023_Toyota_Innova_Cross_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2023_Toyota_Innova_Cross_%28rear%29.jpg/800px-2023_Toyota_Innova_Cross_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2023_Toyota_Innova_Cross_%28side%29.jpg/800px-2023_Toyota_Innova_Cross_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2023_Toyota_Innova_Cross_%28interior%29.jpg/800px-2023_Toyota_Innova_Cross_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2023_Toyota_Innova_Cross_dashboard.jpg/800px-2023_Toyota_Innova_Cross_dashboard.jpg"},
        ],
    },
    "hilux": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_Toyota_Hilux_%28front%29.jpg/800px-2018_Toyota_Hilux_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/2018_Toyota_Hilux_%28rear%29.jpg/800px-2018_Toyota_Hilux_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2018_Toyota_Hilux_%28side%29.jpg/800px-2018_Toyota_Hilux_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2018_Toyota_Hilux_%28interior%29.jpg/800px-2018_Toyota_Hilux_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2018_Toyota_Hilux_dashboard.jpg/800px-2018_Toyota_Hilux_dashboard.jpg"},
        ],
    },
    "yaris_cross": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2022_Toyota_Yaris_Cross_%28front%29.jpg/800px-2022_Toyota_Yaris_Cross_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2022_Toyota_Yaris_Cross_%28rear%29.jpg/800px-2022_Toyota_Yaris_Cross_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2022_Toyota_Yaris_Cross_%28side%29.jpg/800px-2022_Toyota_Yaris_Cross_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2022_Toyota_Yaris_Cross_%28interior%29.jpg/800px-2022_Toyota_Yaris_Cross_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2022_Toyota_Yaris_Cross_dashboard.jpg/800px-2022_Toyota_Yaris_Cross_dashboard.jpg"},
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
    "hrv": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/2022_Honda_HR-V_%28front%29.jpg/800px-2022_Honda_HR-V_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2022_Honda_HR-V_%28rear%29.jpg/800px-2022_Honda_HR-V_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2022_Honda_HR-V_%28side%29.jpg/800px-2022_Honda_HR-V_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2022_Honda_HR-V_%28interior%29.jpg/800px-2022_Honda_HR-V_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2022_Honda_HR-V_dashboard.jpg/800px-2022_Honda_HR-V_dashboard.jpg"},
        ],
    },
    "accord": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2021_Honda_Accord_%28front%29.jpg/800px-2021_Honda_Accord_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/2021_Honda_Accord_%28rear%29.jpg/800px-2021_Honda_Accord_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2021_Honda_Accord_%28side%29.jpg/800px-2021_Honda_Accord_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2021_Honda_Accord_%28interior%29.jpg/800px-2021_Honda_Accord_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2021_Honda_Accord_dashboard.jpg/800px-2021_Honda_Accord_dashboard.jpg"},
        ],
    },
    "brv": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2019_Honda_BR-V_%28front%29.jpg/800px-2019_Honda_BR-V_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2019_Honda_BR-V_%28rear%29.jpg/800px-2019_Honda_BR-V_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_Honda_BR-V_%28side%29.jpg/800px-2019_Honda_BR-V_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2019_Honda_BR-V_%28interior%29.jpg/800px-2019_Honda_BR-V_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2019_Honda_BR-V_dashboard.jpg/800px-2019_Honda_BR-V_dashboard.jpg"},
        ],
    },
    "odyssey": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Honda_Odyssey_%28front%29.jpg/800px-2018_Honda_Odyssey_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/2018_Honda_Odyssey_%28rear%29.jpg/800px-2018_Honda_Odyssey_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/2018_Honda_Odyssey_%28side%29.jpg/800px-2018_Honda_Odyssey_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2018_Honda_Odyssey_%28interior%29.jpg/800px-2018_Honda_Odyssey_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Honda_Odyssey_dashboard.jpg/800px-2018_Honda_Odyssey_dashboard.jpg"},
        ],
    },
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
    "vf5": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg/800px-VinFast_VF_5_at_Vietnam_Motorshow_2022.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VinFast_VF_3_in_Hanoi.jpg/800px-VinFast_VF_3_in_Hanoi.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/VinFast_VF_3_%28Vietnam%29.jpg/800px-VinFast_VF_3_%28Vietnam%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/VinFast_VF3_showcased_in_Hanoi.jpg/800px-VinFast_VF3_showcased_in_Hanoi.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VinFast_VF_3_at_CAMMESA2024.jpg/800px-VinFast_VF_3_at_CAMMESA2024.jpg"},
        ],
    },
    "vf6": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg"},
        ],
    },
    "vf7": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/VinFast_VF_8_Eco.jpg/800px-VinFast_VF_8_Eco.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/VinFast_VF_8_at_hanoi_motorshow.jpg/800px-VinFast_VF_8_at_hanoi_motorshow.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/VinFast_VF8.jpg/800px-VinFast_VF8.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VinFast_VF_8_interior_dashboard.jpg/800px-VinFast_VF_8_interior_dashboard.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/VinFast_VF8_interior.jpg/800px-VinFast_VF8_interior.jpg"},
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
    "cx30": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Mazda_CX-30_%28front%29.jpg/800px-2020_Mazda_CX-30_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2020_Mazda_CX-30_%28rear%29.jpg/800px-2020_Mazda_CX-30_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2020_Mazda_CX-30_%28side%29.jpg/800px-2020_Mazda_CX-30_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/2020_Mazda_CX-30_%28interior%29.jpg/800px-2020_Mazda_CX-30_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Mazda_CX-30_dashboard.jpg/800px-2020_Mazda_CX-30_dashboard.jpg"},
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
    "cx8": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2017_Mazda_CX-5_%28front%29.jpg/800px-2017_Mazda_CX-5_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/2017_Mazda_CX-5_%28rear%29.jpg/800px-2017_Mazda_CX-5_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2017_Mazda_CX-5_%28side%29.jpg/800px-2017_Mazda_CX-5_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2017_Mazda_CX-5_%28interior%29.jpg/800px-2017_Mazda_CX-5_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2017_Mazda_CX-5_dashboard.jpg/800px-2017_Mazda_CX-5_dashboard.jpg"},
        ],
    },
    "mazda6": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28front%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28rear%29.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28side%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg/800px-2019_Mazda3_%28BP%29_Sedan_%28interior%29.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2019_Mazda3_dashboard.jpg/800px-2019_Mazda3_dashboard.jpg"},
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
    "gle": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Mercedes-Benz_X254_IMG_0112.jpg/800px-Mercedes-Benz_X254_IMG_0112.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mercedes-Benz_X254_IMG_0113.jpg/800px-Mercedes-Benz_X254_IMG_0113.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mercedes-Benz_X254_IMG_0114.jpg/800px-Mercedes-Benz_X254_IMG_0114.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mercedes-Benz_X254_interior.jpg/800px-Mercedes-Benz_X254_interior.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mercedes-Benz_X254_cabin.jpg/800px-Mercedes-Benz_X254_cabin.jpg"},
        ],
    },
    "s_class": {
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg",
        "gallery": [
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Mercedes-Benz_W213_IMG_3527.jpg/800px-Mercedes-Benz_W213_IMG_3527.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mercedes-Benz_W213_IMG_3528.jpg/800px-Mercedes-Benz_W213_IMG_3528.jpg"},
            {"type": "EXTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mercedes-Benz_W213_IMG_3529.jpg/800px-Mercedes-Benz_W213_IMG_3529.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mercedes-Benz_W213_interior.jpg/800px-Mercedes-Benz_W213_interior.jpg"},
            {"type": "INTERIOR", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercedes-Benz_W213_cabin.jpg/800px-Mercedes-Benz_W213_cabin.jpg"},
        ],
    },
}

# (full_name, gallery_key, daily, sale, year, seats, trans, fuel, rent_km, sale_km)
CATALOG: list[tuple] = [
    # Toyota (7)
    ("Toyota", "Camry 2.5Q", "camry", 1500000, 1050000000, 2023, 5, "AUTO", "GASOLINE", 18500, 12000),
    ("Toyota", "Corolla Cross 1.8V", "corolla_cross", 900000, 820000000, 2023, 5, "AUTO", "GASOLINE", 22000, 8500),
    ("Toyota", "Fortuner Legender 2.4AT", "fortuner", 1600000, 1150000000, 2023, 7, "AUTO", "DIESEL", 31000, 15000),
    ("Toyota", "Vios 1.5G CVT", "vios", 650000, 480000000, 2023, 5, "AUTO", "GASOLINE", 42000, 28000),
    ("Toyota", "Innova Cross 2.0G", "innova", 1300000, 950000000, 2024, 7, "AUTO", "GASOLINE", 12000, 5000),
    ("Toyota", "Hilux 2.8 Legender", "hilux", 1500000, 1150000000, 2024, 5, "AUTO", "DIESEL", 28000, 11000),
    ("Toyota", "Yaris Cross 1.5G", "yaris_cross", 850000, 720000000, 2024, 5, "AUTO", "GASOLINE", 9500, 6000),
    # Honda (7)
    ("Honda", "City RS 1.5Turbo", "city", 700000, 580000000, 2023, 5, "AUTO", "GASOLINE", 35000, 22000),
    ("Honda", "Civic RS Turbo", "civic", 950000, 780000000, 2023, 5, "AUTO", "GASOLINE", 24000, 14000),
    ("Honda", "CR-V L Turbo", "crv", 1200000, 980000000, 2023, 7, "AUTO", "GASOLINE", 27000, 16000),
    ("Honda", "HR-V G 1.5L", "hrv", 850000, 720000000, 2024, 5, "AUTO", "GASOLINE", 15000, 8000),
    ("Honda", "Accord Turbo", "accord", 1400000, 1250000000, 2023, 5, "AUTO", "GASOLINE", 19000, 10000),
    ("Honda", "BR-V G 1.5CVT", "brv", 800000, 680000000, 2023, 7, "AUTO", "GASOLINE", 38000, 25000),
    ("Honda", "Odyssey 2.4L", "odyssey", 1600000, 1380000000, 2023, 7, "AUTO", "GASOLINE", 45000, 32000),
    # VinFast (7)
    ("VinFast", "VF 3 Standard", "vf3", 650000, 280000000, 2024, 4, "AUTO", "ELECTRIC", 8000, 3500),
    ("VinFast", "VF 5 Plus", "vf5", 900000, 520000000, 2024, 5, "AUTO", "ELECTRIC", 11000, 6000),
    ("VinFast", "VF 6 Eco", "vf6", 1100000, 720000000, 2024, 5, "AUTO", "ELECTRIC", 14000, 7500),
    ("VinFast", "VF 7 Plus", "vf7", 1400000, 920000000, 2024, 5, "AUTO", "ELECTRIC", 9000, 4000),
    ("VinFast", "VF 8 Eco", "vf8", 1800000, 1050000000, 2023, 5, "AUTO", "ELECTRIC", 21000, 12000),
    ("VinFast", "VF 9 Eco", "vf9", 2200000, 1550000000, 2023, 7, "AUTO", "ELECTRIC", 16000, 9000),
    ("VinFast", "VF 8 Premium", "vf8", 2000000, 1150000000, 2024, 5, "AUTO", "ELECTRIC", 7000, 2500),
    # Mazda (7)
    ("Mazda", "Mazda3 2.0G Luxury", "mazda3", 900000, 750000000, 2023, 5, "AUTO", "GASOLINE", 26000, 15000),
    ("Mazda", "CX-5 2.5G Premium", "cx5", 1200000, 980000000, 2023, 5, "AUTO", "GASOLINE", 33000, 18000),
    ("Mazda", "CX-30 2.0G Premium", "cx30", 1000000, 860000000, 2024, 5, "AUTO", "GASOLINE", 14000, 7000),
    ("Mazda", "BT-50 Premium 4x4", "bt50", 950000, 780000000, 2024, 5, "AUTO", "DIESEL", 52000, 35000),
    ("Mazda", "CX-8 2.5G Luxury", "cx8", 1400000, 1150000000, 2023, 7, "AUTO", "GASOLINE", 29000, 16000),
    ("Mazda", "Mazda6 2.5G Premium", "mazda6", 1200000, 1020000000, 2023, 5, "AUTO", "GASOLINE", 41000, 28000),
    ("Mazda", "CX-5 Signature", "cx5", 1250000, 1050000000, 2024, 5, "AUTO", "GASOLINE", 11000, 5500),
    # Mercedes-Benz (7)
    ("Mercedes-Benz", "C 200 Avantgarde", "c_class", 3500000, 1950000000, 2023, 5, "AUTO", "GASOLINE", 22000, 11000),
    ("Mercedes-Benz", "C 300 AMG Line", "c_class", 4000000, 2250000000, 2024, 5, "AUTO", "GASOLINE", 8500, 4000),
    ("Mercedes-Benz", "E 300 AMG Line", "e_class", 5000000, 2850000000, 2024, 5, "AUTO", "GASOLINE", 12000, 6000),
    ("Mercedes-Benz", "GLC 300 4MATIC", "glc", 4200000, 2450000000, 2024, 5, "AUTO", "GASOLINE", 15000, 7500),
    ("Mercedes-Benz", "GLC 200 4MATIC", "glc", 3800000, 2150000000, 2023, 5, "AUTO", "GASOLINE", 28000, 14000),
    ("Mercedes-Benz", "GLE 450 4MATIC", "gle", 5500000, 3850000000, 2024, 5, "AUTO", "GASOLINE", 9000, 3500),
    ("Mercedes-Benz", "S 450 L", "s_class", 7000000, 5200000000, 2024, 5, "AUTO", "GASOLINE", 5000, 2000),
]


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def build_catalog() -> list[dict]:
    if len(CATALOG) != 35:
        raise SystemExit(f"Expected 35 models, got {len(CATALOG)}")
    out: list[dict] = []
    for brand, name, gkey, daily, sale, year, seats, trans, fuel, rent_km, sale_km in CATALOG:
        g = GALLERIES[gkey]
        out.append({
            "brand": brand,
            "model": name,
            "imageUrl": g["imageUrl"],
            "gallery": g["gallery"],
            "salePrice": sale,
            "dailyPrice": daily,
            "modelYear": year,
            "seats": seats,
            "transmission": trans,
            "fuelType": fuel,
            "rentKilometer": rent_km,
            "saleKilometer": sale_km,
        })
    return out


def build_models_sql(catalog: list[dict]) -> str:
    lines = ["/* Models — 35 tên trim thực tế */"]
    for entry in catalog:
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
    print(f"Wrote {len(catalog)} entries -> {OUT_CATALOG}")


if __name__ == "__main__":
    main()
