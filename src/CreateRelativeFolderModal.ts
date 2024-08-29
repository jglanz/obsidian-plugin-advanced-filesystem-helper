import { App, FuzzySuggestModal, TFolder, Vault, MarkdownView, TFile, Platform, normalizePath, Modal, Instruction } from 'obsidian'
import * as path from 'path'
// import CreateNoteModal from './CreateNoteModal';
// import { NewFileLocation } from './enums';

const EMPTY_TEXT = 'No folder name specified. Press esc to dismiss.'
const PLACEHOLDER_TEXT = 'Type folder name to create.'
const instructions = [
	{ command: '↑↓', purpose: 'to navigate' },
	{ command: '↵', purpose: 'to create folder' },
	{ command: 'esc', purpose: 'to dismiss' },
]


type FolderPathMap = { [path: string]: TFolder }


export default class CreateRelativeFolderModal extends Modal {
	folders: TFolder[]
	folderPathMap: FolderPathMap
	relativePathEl: HTMLDivElement
	newDirectoryPath: string
	inputEl: HTMLInputElement;
  	instructionsEl: HTMLElement;
	inputListener: EventListener
	inputChangeListener:EventListener
	dataPathFolder: TFolder

	constructor(app: App, readonly dataPath: string) {
		super(app)

		this.relativePathEl = document.createElement('div');
		this.relativePathEl.addClass('prompt-instructions');
		this.relativePathEl.innerText = `Create folder in ${dataPath ?? '/'}`
		// create input
		this.inputEl = document.createElement('input');
		this.inputEl.type = 'text';
		this.inputEl.placeholder = PLACEHOLDER_TEXT;
		this.inputEl.className = 'prompt-input';
	
		// create instructions
		const instructions = [
		  {
			command: '↵',
			purpose: 'to create note (default: Untitled)',
		  },
		  {
			command: 'esc',
			purpose: 'to dismiss creation',
		  },
		] as Instruction[];
		this.instructionsEl = document.createElement('div');
		this.instructionsEl.addClass('prompt-instructions');
		const children = instructions.map((x) => {
		  const child = document.createElement('div');
		  child.addClass('prompt-instruction');
	
		  const command = document.createElement('span');
		  command.addClass('prompt-instruction-command');
		  command.innerText = x.command;
		  child.appendChild(command);
	
		  const purpose = document.createElement('span');
		  purpose.innerText = x.purpose;
		  child.appendChild(purpose);
	
		  return child;
		});
		for (const child of children) {
		  this.instructionsEl.appendChild(child);
		}
	
		// make modal
		this.modalEl.className = 'prompt';
		// this.modalEl.innerHTML = '';
		this.modalEl.appendChild(this.titleEl);
		this.modalEl.appendChild(this.inputEl);
		this.modalEl.appendChild(this.instructionsEl);
	
		this.init()
	}

	init() {
		const folders = new Set() as Set<TFolder>
		const sortedFolders = [] as TFolder[]
		let leaf = this.app.workspace.getLeaf(false)
		if (leaf &&
			leaf.view instanceof MarkdownView &&
			leaf.view.file instanceof TFile &&
			leaf.view.file.parent instanceof TFolder) {
			// pre-select current folder
			folders.add(leaf.view.file.parent)
			sortedFolders.push(leaf.view.file.parent)
		}
		Vault.recurseChildren(this.app.vault.getRoot(), (file) => {
			if (file instanceof TFolder && !folders.has(file)) {
				folders.add(file)
				sortedFolders.push(file)
			}
		})
		this.folderPathMap = sortedFolders
		.reduce((map, folder) => ({ 
			...map, 
			[folder.path]: folder 
		}), {} as FolderPathMap)
		this.folders = sortedFolders

		const dataPathFolder = this.dataPathFolder =this.folderPathMap[this.dataPath]
		console.log("Data path target", dataPathFolder)
		
		// this.emptyStateText = EMPTY_TEXT
		// this.setPlaceholder(PLACEHOLDER_TEXT)
		// this.setInstructions(instructions)
		
this.inputChangeListener = this.listenInputChange.bind(this)
		this.inputListener = this.listenInput.bind(this)
	}


	// shouldCreateFolder(evt: MouseEvent | KeyboardEvent): boolean {
	//   if (this.newDirectoryPath.endsWith('/')) {
	//     return true;
	//   }
	//   if (evt instanceof KeyboardEvent && evt.key == 'Enter') {
	//     return true;
	//   }
	//   return false;
	// }

	findCurrentSelect(): HTMLElement {
		return document.querySelector('.suggestion-item.is-selected')
	}
	
	listenInputChange(evt: InputEvent) {
		this.titleEl.innerText = `Create ${this.dataPath}/${evt.data}`
	}
	listenInput(evt: KeyboardEvent) {
		if (evt.key === 'Enter') {
			// prevent enter after note creation
			evt.preventDefault();
			// Do work
			this.createNewFolder(this.inputEl.value);
			this.close();
		  }
	}

	onOpen() {
		super.onOpen()
		this.inputEl.addEventListener('keydown', this.inputListener)
		this.inputEl.addEventListener('change', this.inputChangeListener)
	}

	onClose() {
		this.inputEl.removeEventListener('keydown', this.inputListener)
		super.onClose()
	}

	createNewFolder(newFolderName: string): void {
		// if (this.newDirectoryPath?.length > 0) {
		const parentFolder = this.dataPathFolder ?? app.vault.getRoot()
		this.createDirectory(parentFolder, newFolderName)
				.catch(err => console.error("Unable to create new directory", err))
		//}
		// if (this.noSuggestion) {
		//   if (!this.shouldCreateFolder(evt)) {
		//     return;
		//   }
		//   this.createNoteModal.setFolder(
		//     this.app.vault.getRoot(),
		//     this.newDirectoryPath
		//   );
		// } else {
		//   this.createNoteModal.setFolder(item, '');
		// }
		// this.createNoteModal.open();
	}

	/**
	 * Creates a directory (recursive) if it does not already exist.
	 * This is a helper function that includes a workaround for a bug in the
	 * Obsidian mobile app.
	 */
	async createDirectory(item: TFolder, dir: string): Promise<void> {
		const { vault } = this.app
		const { adapter } = vault
		// const root = vault.getRoot().path;
		const directoryPath = path.join(item.path, dir)
		const directoryExists = await adapter.exists(directoryPath)
		// ===============================================================
		// -> Desktop App
		// ===============================================================
		if (!Platform.isDesktop) {
			return
		}

		if (!directoryExists) {
			return adapter.mkdir(normalizePath(directoryPath))
		}

	}


	
	itemInstructionMessage(resultEl: HTMLElement, message: string) {
		const el = document.createElement('kbd')
		el.addClass('suggestion-hotkey')
		el.innerText = message
		resultEl.appendChild(el)
	}
}
