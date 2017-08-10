import shutil
from urllib.request import urlopen
import zipfile
import os
from contextlib import closing


def download_data(url, file_name, destination_dir):
    """Downloads file_name.zip from base_url.file_name.zip, downoloads to destination_dir and extracts"""

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

    zip_ref = zipfile.ZipFile(dest_path, 'r')
    print('extracting data to ')
    zip_ref.extractall(os.path.join('RawData', file_name))
    zip_ref.close()


if __name__ == "__main__":
    destination_folder = os.path.join(os.getcwd(), 'RawData')
    print(destination_folder)
    shutil.rmtree(destination_folder, ignore_errors=True)
    file_urls = {'C2012': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/Redist2010/Plans/congress/C2012/C2012.zip',
                 'C2002': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/C2002.zip',
                 'C1994': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/con94.zip'
    }
    for k, v in file_urls.items():
        download_data(v, k, 'RawData')


