import shutil
import urllib2
import zipfile
import os
from contextlib import closing


def download_data(base_url, file_list, destination_dir):
    """Downloads file_name.zip from base_url.file_name.zip, downoloads to destination_dir and extracts"""

    try:
        os.stat(destination_dir)
    except:
        print('Did not find directory, creating new directory {}'.format(destination_dir))
        os.mkdir(destination_dir)


    url_list = [base_url.format(file_name) for file_name in file_list]
    for url in url_list:
        print('downloading data from {0}'.format(url))
        with closing(urllib2.urlopen(url)) as r:
            dest_path = os.path.join(destination_dir, file_name)
            with open(dest_path, 'wb') as f:
                shutil.copyfileobj(r, f)

    zip_ref = zipfile.ZipFile(dest_path, 'r')
    print('')
    zip_ref.extractall('RawData')
    zip_ref.close()


if __name__ == "__main__":
    file_list = ['C2012', 'C2002', 'C1994']
    base_url = 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/Redist2010/Plans/congress/{0}/{0}.zip'
    download_data(base_url, file_list, 'RawData')


