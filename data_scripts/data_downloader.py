import shutil
import sys
import os
import zipfile
import csv
from multiprocessing import Pool
import tarfile
import argparse

PY3 = sys.version_info > (3,)
if PY3:
    from urllib.request import urlretrieve
else:
    from urllib import urlretrieve


def download_file(out_dir, file_name, url):
    """Downloads file_name from base_url.file_name.zip, downloads to folder RawData in root"""

    if not os.path.exists(out_dir):
        print('Creating new directory {}'.format(out_dir))
        os.mkdir(out_dir)

    print('downloading data from {}'.format(url))

    filehandle, _ = urlretrieve(url)

    split_name = os.path.splitext(file_name)
    if split_name[1] == '.zip':
        zip_ref = zipfile.ZipFile(filehandle, 'r')
        zip_ref.extractall(os.path.join(out_dir, split_name[0]))
    if split_name[1] == '.gz':
        tar_ref = tarfile.open(filehandle, 'r:gz')
        tar_ref.extractall(os.path.join(out_dir, split_name[0]))


def _download_file(x):
    """A wrapper for download_file that allows it to be used with multiprocessing"""
    download_file('./RawData', *x)


def download_files(file_list):
    """Downloads a list of files structured as filename, url"""
    p = Pool()
    p.map(_download_file, file_list)


class GerryData:
    """

    """

    def __init__(self, root='.'):
        print('root directory is {0}'.format(os.path.abspath(root)))
        self.root = root
        self.raw_dir = os.path.join(self.root, 'RawData')
        self.extracted_dir = os.path.join(self.root, 'ExtractedData')
        self.clean_directory()

    def clean_directory(self):
        shutil.rmtree(self.raw_dir, ignore_errors=True)
        shutil.rmtree(self.extracted_dir, ignore_errors=True)
        os.mkdir(self.raw_dir)
        os.mkdir(self.extracted_dir)

    def download_file(self, file_name, url):
        """Downloads file_name from base_url.file_name.zip, downloads to folder RawData in root"""

        destination_dir = os.path.join(self.root, 'RawData')
        download_file(destination_dir, file_name, url)

    def down_files(self, file_list):
        """Downloads a list of files structured as filename, url"""
        p = Pool(1)
        p.map(_download_file, file_list)

    def process_raw(self):
        """"
        1. Extract only desired columns
        2. Rename column in uniform manner
        3. Re-project to 4326
        """
        shps = []
        for root, dirs, files in os.walk('RawData'):
            for file in files:
                if file.endswith('.shp'):
                    shps.append(file)

        for shp in shps:
            f_out = os.path.join(self.root, 'ExtractedData', os.path.basename(shp))
            self.process_file(shp, f_out, {})

    @staticmethod
    def process_file(f_in, f_out, field_dictionary):
        """Takes in a file in_path, extracts fields based on field_dicionary,

        :param file: .shp file
        :param field_dictionary: dictionary of field names making explicit
        :return:
        """

        print(f_out)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extacts fils from list of urls')
    parser.add_argument('--out', default='.',
                        help='where to write files to (default: current working directory)')
    parser.add_argument('--file_list', default='./url_list.csv',
                        help='List of file names and urls to download. '
                             'Format: <FileName>,<url> '
                             'no spaces, no quotation marks. (default: ./url_list.csv')

    args = parser.parse_args()

    downloader = GerryData(args.out)

    with open(args.file_list, 'r') as f:
        file_urls = list(csv.reader(f))

    download_files(file_urls)

    #foo.process_raw()
    #os.rename(os.path.join(foo.raw_dir, 'C2002', 'C2002.DBF'),
    #          os.path.join(foo.raw_dir, 'C2002', 'c2002.dbf'))
