var FileSystem = require("FuseJS/FileSystem");
var Storage = require("FuseJS/Storage");
var PATH = FileSystem.dataDirectory + "/" + "settings.json";

const FILE = "settings.json";

class DataStore {
    isExists(){
        return FileSystem.existsSync(PATH) ;
    }


    store(data) {
        FileSystem.writeTextToFileSync(PATH, data);

    }


    read() {
        return FileSystem.readTextFromFileSync(PATH);
    }

}
module.exports = {
    DataStore: new DataStore()
}
