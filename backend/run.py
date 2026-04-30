#!/usr/bin/env python3
"""Entry point for the CASE Backend application."""

import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3001))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
