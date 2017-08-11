import shutil
from urllib.request import urlopen
import zipfile
import os
import subprocess
from contextlib import closing


def download_data(url, file_name, destination_dir):
    """Downloads file_name.zip from base_url.file_name.zip, downloads to destination_dir"""

    try:
        os.stat(destination_dir)
    except:
        print('Did not find directory, creating new directory {}'.format(destination_dir))
        os.mkdir(destination_dir)

    dest_path = os.path.join(destination_dir, file_name+'.zip')

    print('downloading data from {0}, writing to {1}'.format(url, dest_path))
    with closing(urlopen(url)) as r:
        with open(dest_path, 'wb') as f:
            shutil.copyfileobj(r, f)


def extract_data(directory):
    """unzips all zip files in a folder"""

    zip_files = [f for f in os.listdir(directory) if f.endswith('.zip')]
    for z in zip_files:
        zip_ref = zipfile.ZipFile(os.path.join(directory, z), 'r')
        file_name = os.path.join(directory, os.path.splitext(z)[0])
        print('extracting data to {0}'.format(file_name))
        zip_ref.extractall(os.path.join(directory, file_name))
        zip_ref.close()


def combine_data(file_list):
    output_file = os.path.join('RawData', 'joined.geojson')
    input_file = os.path.join('RawData', 'C1994', 'con94.shp')
    sql = "SELECT AREA as Area, POPULATION as Population, DISTRICT as District FROM {}".format('C1994')
    command = ['ogr2ogr', '-f', 'GeoJSON', '-sql', sql,
               output_file,  input_file]
    subprocess.check_call(command)

if __name__ == "__main__":
    destination_folder = os.path.join(os.getcwd(), 'RawData')
    print(destination_folder)
    #shutil.rmtree(destination_folder, ignore_errors=True)
    file_urls = {'C2012': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/Redist2010/Plans/congress/C2012/C2012.zip',
                 'C2002': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/C2002.zip',
                 'C1994': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/con94.zip'
    }
    #for k, v in file_urls.items():
    #    download_data(v, k, 'RawData')
    #extract_data(destination_folder)

    foo = []
    for root, dirs, files in os.walk('RawData'):
        for file in files:
            if file.endswith('.shp'):
                foo.append(file)

    combine_data(foo)


