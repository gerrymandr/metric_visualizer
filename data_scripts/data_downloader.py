"""
Downloads and uncompresses data from a list of urls.

File to read from must be a .csv with no headers, formatted as follows:
<FileName>,<url>
<FileName1>,<url1>
<FileName2>,<url2>

See all.csv for an example
"""

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
    """Downloads file from url and extracts into out_dir

    :param out_dir: Directory to write to
    :param file_name: Name of file, including file extension.
    :param url: Path to download from
    :return: None
    """

    if not os.path.exists(out_dir):
        print('Creating new directory {}'.format(out_dir))
        os.mkdir(out_dir)

    print('downloading data from {}'.format(url))

    filehandle, _ = urlretrieve(url)

    split_name = os.path.splitext(file_name)
    if split_name[1] == '.zip':
        zip_ref = zipfile.ZipFile(filehandle, 'r')
        zip_ref.extractall(os.path.join(out_dir, split_name[0]))
    elif split_name[1] == '.gz':
        tar_ref = tarfile.open(filehandle, 'r:gz')
        tar_ref.extractall(os.path.join(out_dir, split_name[0]))
    else:
        os.rename(filehandle, os.path.join(out_dir, file_name))


def _download_file(x):
    """A wrapper for download_file that allows it to be used with multiprocessing

    :param x: A dictionary with keys out_dir, file_name, url to be passed to download_file
    :return: None
    """
    download_file('./RawData', *x)


def download_files(file_list):
    """Downloads a list of files structured as filename, url

    :param file_list: A list of dictionaries with keys out_dir, file_name, url to be passed to download_file
    :return: None
    """
    p = Pool()
    p.map(_download_file, file_list)


def clean_directory(root):
    directory = os.path.join(root, 'RawData')
    shutil.rmtree(directory, ignore_errors=True)
    os.mkdir(directory)



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extacts fils from list of urls')
    parser.add_argument('--out', default='.',
                        help='where to write files to (default: current working directory)')
    parser.add_argument('--file_list', default='./all.csv',
                        help='List of file names and urls to download. '
                             'Format: <FileName>,<url> '
                             'no spaces, no quotation marks. (default: ./all.csv')

    args = parser.parse_args()
    root_dir = args.out

    clean_directory(root_dir)

    with open(args.file_list, 'r') as f:
        file_urls = list(csv.reader(f))

    download_files(file_urls)

    # Fixes file names from the default datasource, allowing ogr tools to read it.
    #os.rename(os.path.join(downloader.raw_dir, 'C2002', 'C2002.DBF'),
    #          os.path.join(downloader.raw_dir, 'C2002', 'c2002.dbf'))
