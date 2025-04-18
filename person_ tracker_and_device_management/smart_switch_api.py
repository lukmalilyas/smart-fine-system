from fastapi import FastAPI, HTTPException
from tuya_connector import TuyaOpenAPI
from loguru import logger
import uvicorn


# Tuya Credentials and Config
ACCESS_ID = 'exej8emeafuwgguhyxaa'
ACCESS_KEY = '2fe58f30a27a430d86786e236fed6f6f'
ENDPOINT = 'https://openapi.tuyain.com'
SWITCH_DEVICE_ID = 'd73ef3d69aa96e763a9tbn'

# Create FastAPI app
app = FastAPI()


@app.on_event("startup")
async def init_tuya():
    global api
    try:
        api = TuyaOpenAPI(ENDPOINT, ACCESS_ID, ACCESS_KEY)
        api.connect()
        logger.info("Connected to Tuya API successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to Tuya: {e}")
        api = None

@app.get("/")
async def health():
    return {"message": "online"}

@app.post("/turn-on")
async def turn_on_device():
    if not api:
        raise HTTPException(status_code=500, detail="Tuya API not initialized")

    try:
        command = {'commands': [{'code': 'switch_1', 'value': True}]}
        response = api.post(f"/v1.0/iot-03/devices/{SWITCH_DEVICE_ID}/commands", command)
        if response.get("success"):
            return {"message": "Device turned ON"}
        else:
            raise HTTPException(status_code=500, detail=response.get("msg", "Tuya command failed"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)