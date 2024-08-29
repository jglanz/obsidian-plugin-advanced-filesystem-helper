import { Plugin } from 'obsidian';
import { NewFileLocation } from './enums';
import CreateRelativeFolderModal from './CreateRelativeFolderModal';

function getParentPath(dataPath: string): string {
	let parts = dataPath.split("/")
	parts.pop()
	return parts.join("/")
}

function getFocusedFilePath() {
	const navElem = document.querySelectorAll("div[data-type=file-explorer] .has-focus[data-path]")[0]
	if (!navElem)
		return null
	const dataPath = navElem.getAttribute("data-path")
	console.log("Selected folder path", dataPath,"elem",navElem)   
	const isFile = navElem.hasClass("nav-file-title")
	return {
		isFile,
		isFolder: !isFile, 
		dataPath,
		folderPath: !isFile ? dataPath : !dataPath.includes("/") ? "/" : getParentPath(dataPath)
	}

}

export default class AdvancedFileSystemHelperPlugin extends Plugin {
  async onload() {
    console.log('loading plugin');

    this.addCommand({
      id: "advanced-fs-new-dir",
      name: "Create new directory in the current note's parent",
      callback: () => {
		let currentPath = getFocusedFilePath()	
		console.log(currentPath)
        new CreateRelativeFolderModal(this.app,currentPath.folderPath).open();
      },
    });

    // this.addCommand({
    //   id: 'advanced-new-file-new-pane',
    //   name: 'Create note in a new pane',
    //   callback: () => {
    //     new ChooseFolderModal(this.app, NewFileLocation.NewPane).open();
    //   },
    // });

    // this.addCommand({
    //   id: 'advanced-new-file-new-tab',
    //   name: 'Create note in a new tab',
    //   callback: () => {
    //     new ChooseFolderModal(this.app, NewFileLocation.NewTab).open();
    //   },
    // });
  }

  onunload() {
    console.log('unloading plugin');
  }
}
