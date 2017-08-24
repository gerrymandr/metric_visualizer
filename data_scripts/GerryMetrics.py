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

    # Fixes file names from the default datasource, allowing ogr tools to read it.
    #os.rename(os.path.join(downloader.raw_dir, 'C2002', 'C2002.DBF'),
    #          os.path.join(downloader.raw_dir, 'C2002', 'c2002.dbf'))