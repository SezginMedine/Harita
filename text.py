from flask import Flask, jsonify
import os
from flask_cors import CORS
import pyodbc
import geopandas as gpd
from shapely.geometry import Point
import json
# -*- coding:utf-8 -*-

app = Flask(__name__)
CORS(app)

server = '.'
database = 'ibb'
username = 'sa'
password = '123'

@app.route('/api/run', methods=['GET'])
def create_geojson():
    connection_string = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};'
    connection = pyodbc.connect(connection_string)

    query = 'SELECT * FROM depolar'
    cursor = connection.cursor()
    cursor.execute(query)

    data = []
    for row in cursor:
        sira_no,deponun_yeri,kapasite,depo_sayisi,alani,depolanan_urun,y,x= row
        if  isinstance(y, (float, int)) and isinstance(x, (float, int)) :
          point = Point(y, x)
      
        data.append({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [y, x]
            },
            'properties': {
                'description':{
                    'siraNo' : sira_no,
                    'deponunYeri' : deponun_yeri,
                    'kapasite' : kapasite,
                    'depoSayisi' : depo_sayisi,
                    'alani' : alani,
                    'depolananUrun' : depolanan_urun

                },
              
            }
        })

    geojson_data = {
        'type': 'FeatureCollection',
        'features': data
    }
    return jsonify(geojson_data, )

if __name__== '__main__':
    app.run(debug=True)