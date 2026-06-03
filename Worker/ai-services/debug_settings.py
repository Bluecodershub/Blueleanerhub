import os
import sys
# Set PYTHONPATH to root
sys.path.append(os.getcwd())

try:
    from app.config import settings
    print("SUCCESS: Settings loaded correctly")
    print(f"App Name: {settings.app_name}")
    print(f"Allowed Origins: {settings.allowed_origins}")
except Exception as e:
    print(f"FAILURE: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
