import { Plugin } from 'obsidian';
import { NewFileLocation } from './enums';
import ChooseParentFolderModal from './ChooseParentFolderModal';


export default class AdvancedFileSystemHelperPlugin extends Plugin {
  async onload() {
    console.log('loading plugin');

    this.addCommand({
      id: "advanced-fs-new-dir",
      name: "Create new directory in the current note's parent",
      callback: () => {
        new ChooseParentFolderModal(this.app).open();
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
