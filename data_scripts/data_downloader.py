"""
Downloads and decompresses data from a list of urls.

File to read from must be a .csv with headers 'file_name' and 'url':
file_name, url
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
from multiprocessing.dummy import Pool
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

    print('Downloading data from {}'.format(url))

    file_handle, _ = urlretrieve(url)

    split_name = os.path.splitext(file_name)
    if split_name[1] == '.zip':
        zip_ref = zipfile.ZipFile(file_handle, 'r')
        zip_ref.extractall(os.path.join(out_dir, split_name[0]))
    elif split_name[1] == '.gz':
        tar_ref = tarfile.open(file_handle, 'r:gz')
        tar_ref.extractall(os.path.join(out_dir, split_name[0]))
    else:
        os.rename(file_handle, os.path.join(out_dir, file_name))


def _download_file(x):
    """A wrapper for download_file that allows it to be used with multiprocessing

    :param x: A dictionary with keys out_dir, file_name, url to be passed to download_file
    :return: None
    """
    download_file(**x)


def download_files(file_list):
    """Downloads a list of files structured as filename, url

    :param file_list: A list of dictionaries with keys out_dir, file_name, url to be passed to download_file
    :return: None
    """
    p = Pool()
    p.map(_download_file, file_list)
    p.close()


def remake_directory(directory):
    """Creates directory, deleting first if necessary."""
    shutil.rmtree(directory, ignore_errors=True)
    os.mkdir(directory)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extacts fils from list of urls')
    parser.add_argument('--out', default='./RawData',
                        help='where to write files to (default: ./RawData)')
    parser.add_argument('--file_list', default='./all.csv',
                        help='List of file names and urls to download. '
                             'Format: <FileName>,<url> '
                             'no spaces, no quotation marks. (default: ./all.csv')
    parser.add_argument('--clean_dir', default=False,
                        help='Delete and recreate the out directory if it already exists')
    parser.add_argument('--quote_char', default=None,
                        help='Quote Character for file_list (default: None')

    # parse arguments
    args = parser.parse_args()
    out_dir = args.out

    # clean directory
    if args.clean_dir:
        remake_directory(out_dir)
    elif not os.path.isdir(out_dir):
        os.mkdir(out_dir)

    # read csv
    with open(args.file_list, 'r') as f:

        file_urls = [row for row in csv.DictReader(f, quotechar=args.quote_char)]
        for row in file_urls:
            row.update({'out_dir': out_dir})

    # download and extract files
    download_files(file_urls)
