"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLUGIN_CACHE_FOLDER = void 0;
const sfpowerkit_1 = require("../sfpowerkit");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const os = require("os");
const SEP = /\/|\\/;
exports.PLUGIN_CACHE_FOLDER = "sfpowerkit";
class FileUtils {
  /**
   * Delete file or directories recursively from the project
   * @param deletedComponents Files or directories to delete
   */
  static deleteComponents(deletedComponents) {
    deletedComponents.forEach((component) => {
      if (fs.existsSync(component)) {
        if (fs.lstatSync(component).isDirectory()) {
          FileUtils.deleteFolderRecursive(component);
        } else {
          fs.unlinkSync(component);
        }
      }
    });
  }
  /**
   * Load all files from the given folder with the given extension
   * @param folder the folder from which files wille be loaded
   * @param extension File extension to load.
   */
  static getAllFilesSync(folder, extension = ".xml") {
    let result = [];
    let pathExists = fs.existsSync(folder);
    let folderName = path.basename(folder);
    if (!pathExists) {
      sfpowerkit_1.SFPowerkit.log(
        "Folder not exists: " + folderName,
        sfpowerkit_1.LoggerLevel.ERROR
      );
      return result;
    }
    let content = fs.readdirSync(folder);
    content.forEach((file) => {
      let curFile = path.join(folder, file);
      let stats = fs.statSync(curFile);
      if (stats.isFile()) {
        if (
          extension.indexOf(path.extname(curFile)) != -1 ||
          extension === ""
        ) {
          result.push(curFile);
        }
      } else if (stats.isDirectory()) {
        let files = this.getAllFilesSync(curFile, extension);
        result = _.concat(result, files);
      }
    });
    return result;
  }
  static getGlobalCacheDir() {
    let homedir = os.homedir();
    let configDir = homedir + path.sep + exports.PLUGIN_CACHE_FOLDER;
    if (!fs.existsSync(configDir)) {
      sfpowerkit_1.SFPowerkit.log(
        "Config folder does not exists, Creating Folder",
        sfpowerkit_1.LoggerLevel.INFO
      );
      fs.mkdirSync(configDir);
    }
    return configDir;
  }
  /**
   * Get the cache path for the given cache file name
   * @param fileName
   */
  static getGlobalCachePath(fileName) {
    let homedir = os.homedir();
    let configDir = homedir + path.sep + exports.PLUGIN_CACHE_FOLDER;
    if (!fs.existsSync(configDir)) {
      sfpowerkit_1.SFPowerkit.log(
        "Config folder does not exists, Creating Folder",
        sfpowerkit_1.LoggerLevel.INFO
      );
      fs.mkdirSync(configDir);
    }
    return configDir + path.sep + fileName;
  }
  /**
   * Create a folder path recursively
   * @param targetDir
   * @param param1
   */
  static mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : "";
    const baseDir = isRelativeToScript ? __dirname : ".";
    targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
      } catch (err) {
        if (
          err.code !== "EEXIST" &&
          err.code !== "EPERM" &&
          err.code !== "EISDIR"
        ) {
          throw err;
        }
      }
      return curDir;
    }, initDir);
  }
  /**
   * Get the file name withoud extension
   * @param filePath file path
   * @param extension extension
   */
  static getFileNameWithoutExtension(filePath, extension) {
    let fileParts = filePath.split(SEP);
    let fileName = fileParts[fileParts.length - 1];
    if (extension) {
      fileName = fileName.substr(0, fileName.lastIndexOf(extension));
    } else {
      fileName = fileName.substr(0, fileName.indexOf("."));
    }
    return fileName;
  }
  /**
   * Copu folder recursively
   * @param src source folder to copy
   * @param dest destination folder
   */
  static copyRecursiveSync(src, dest) {
    let exists = fs.existsSync(src);
    if (exists) {
      let stats = fs.statSync(src);
      let isDirectory = stats.isDirectory();
      if (isDirectory) {
        exists = fs.existsSync(dest);
        if (!exists) {
          fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(function (childItemName) {
          FileUtils.copyRecursiveSync(
            path.join(src, childItemName),
            path.join(dest, childItemName)
          );
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  }
  /**
   * Get path to a given folder base on the parent folder
   * @param src  Parent folder
   * @param foldername folder to build the path to
   */
  static getFolderPath(src, foldername) {
    let exists = fs.existsSync(src);
    let toReturn = "";
    if (exists) {
      let stats = fs.statSync(src);
      let isDirectory = stats.isDirectory();
      if (isDirectory) {
        let childs = fs.readdirSync(src);
        for (let i = 0; i < childs.length; i++) {
          let childItemName = childs[i];
          if (childItemName === foldername) {
            toReturn = path.join(src, childItemName);
          } else {
            let childStat = fs.statSync(path.join(src, childItemName));
            if (childStat.isDirectory()) {
              toReturn = FileUtils.getFolderPath(
                path.join(src, childItemName),
                foldername
              );
            }
          }
          if (toReturn !== "") {
            break;
          }
        }
      }
    }
    return toReturn;
  }
  /**
   * Delete a folder and its content recursively
   * @param folder folder to delete
   */
  static deleteFolderRecursive(folder) {
    if (fs.existsSync(folder)) {
      fs.readdirSync(folder).forEach(function (file, index) {
        let curPath = path.join(folder, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          //console.log("Delete recursively");
          FileUtils.deleteFolderRecursive(curPath);
        } else {
          // delete file
          //console.log("Delete file "+ curPath);
          fs.unlinkSync(curPath);
        }
      });
      //console.log("delete folder "+ folder);
      fs.rmdirSync(folder);
    }
  }
  static makefolderid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
exports.default = FileUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2ZpbGV1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4Q0FBd0Q7QUFFeEQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXpCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUVQLFFBQUEsbUJBQW1CLEdBQUcsWUFBWSxDQUFDO0FBRWhELE1BQXFCLFNBQVM7SUFDNUI7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLGdCQUFnQixDQUFDLGlCQUEyQjtRQUN4RCxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUN0QyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDekMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUM1QztxQkFBTTtvQkFDTCxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUMxQjthQUNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxlQUFlLENBQzNCLE1BQWMsRUFDZCxZQUFvQixNQUFNO1FBRTFCLElBQUksTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUMxQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksVUFB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
