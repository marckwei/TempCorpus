import os

def insert_a_js(file_path,lib):
    with open(lib, 'r') as a_file:
        content = a_file.read()
    with open(file_path, 'r+') as f:
        existing_content = f.read()
        f.seek(0)
        f.write(content + '\n' + existing_content)
def get_lib(path):
    if path.find("ChakraCore/") != -1 or path.find("chakra/") != -1:
        return "./jslib/chakra.js"
    elif path.find("spidermonkey/") != -1 or path.find("firefox/") != -1:
        return "./jslib/ffx.js"
    elif path.find("jsc/") != -1:
        return "./jslib/jsc.js"
    elif path.find("v8/") != -1:
        return "./jslib/v8.js"
    else:
        return ""

def traverse_folder(folder_path):
    for item in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item)
        if os.path.isdir(item_path):
            traverse_folder(item_path)
        elif item.endswith('.js'):
            lib = get_lib(item_path)
            if len(lib) > 0:
                insert_a_js(item_path,lib)

def delete_files_with_extension(path, extension):
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(extension):
                os.remove(os.path.join(root, file))



if __name__ == '__main__':
    delete_files_with_extension(".", ".jsi")
    delete_files_with_extension(".", ".t")
    folder_path = './NewCorpusForDIE'
    traverse_folder(folder_path)

