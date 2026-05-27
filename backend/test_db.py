import sys
import os

from database import Base
import models

print("Tables:", Base.metadata.tables.keys())
