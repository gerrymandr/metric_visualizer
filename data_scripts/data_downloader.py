import shutil
import sys
import os
import zipfile

print(sys.version_info)
PY3 = sys.version_info > (3,)
if PY3:
    from urllib.request import urlretrieve
else:
    from urllib import urlretrieve


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

    def download_data(self, url, file_name):
        """Downloads file_name.zip from base_url.file_name.zip, downloads to folder RawData in root"""

        destination_dir = os.path.join(self.root, 'RawData')
        if not os.path.exists(destination_dir):
            print('Creating new directory {}'.format(destination_dir))
            os.mkdir(destination_dir)

        print('downloading data from {}'.format(url))

        filehandle, _ = urlretrieve(url)

        split_name = os.path.splitext(file_name)
        if split_name[1] == '.zip':
            zip_ref = zipfile.ZipFile(filehandle, 'r')
            zip_ref.extractall(os.path.join(destination_dir, split_name[0]))

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
    foo = GerryData()
    file_urls = {'C2012.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/Redist2010/Plans/congress/C2012/C2012.zip',
                 'C2002.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/C2002.zip',
                 'C1994.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/con94.zip',
                 'S2012.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/Redist2010/Plans/legislative/L2012/S2012.zip',
                 'S2002.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/S2002.zip',
                 'S1994.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/S1994.zip',
                 'L2012.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/L2012-1.zip',
                 'L2002.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/L2002.zip',
                 'L1994.zip': 'ftp://ftp.commissions.leg.state.mn.us/pub/gis/shape/L1994.zip'
    }

    for k, v in file_urls.items():
        foo.download_data(v, k)

    foo.process_raw()
    os.rename(os.path.join(foo.raw_dir, 'C2002', 'C2002.DBF'),
              os.path.join(foo.raw_dir, 'C2002', 'c2002.dbf'))

    # combine_data(foo)


