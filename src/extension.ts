import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const selectPathProvider = new DirectoryTreeProvider();
	const selectLanguageProvider = new LanguageProvider();
	vscode.window.registerTreeDataProvider('selectPathByEfs', selectPathProvider);

	// 드롭다운 메뉴 구현
	let selectLanguageCommand = vscode.commands.registerCommand('extension.selectLanguage', async () => {
		const languages = ['Java', 'Python'];
		const selectedLanguage = await vscode.window.showQuickPick(languages, {
			placeHolder: 'Select the programming language for analysis'
		});
		if (selectedLanguage) {
			vscode.window.showInformationMessage(`Selected language: ${selectedLanguage}`);
			selectLanguageProvider.setSelectedLanguage(selectedLanguage);
		}
	});

	// 코드 스캔 버튼 기능 추가
	let scanCodeCommand = vscode.commands.registerCommand('extension.scanCode', async () => {
		const selectedPath = selectPathProvider.selectedPath;
		const selectedLanguage = selectLanguageProvider.selectedLanguage;

		if (selectedPath && selectedLanguage) {
			await requestScan(selectedPath, selectedLanguage);
			vscode.window.showInformationMessage('Code scan requested.');
		} else {
			vscode.window.showErrorMessage('Please select a path and language first.');
		}
	});

	context.subscriptions.push(selectLanguageCommand, scanCodeCommand);
}

// 디렉토리 Tree Provider
class DirectoryTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	selectedPath: string | undefined;

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
		return fetchDirectory().then((directories) => {
			return directories.map((dir) => {
				return new vscode.TreeItem(dir, vscode.TreeItemCollapsibleState.None);
			});
		});
	}
}

// 언어 선택에 사용될 객체 (상태 저장)
class LanguageProvider {
	selectedLanguage: string | undefined;

	setSelectedLanguage(language: string) {
		this.selectedLanguage = language;
	}
}

// 스캔 요청 함수
async function requestScan(path: string, language: string) {
	const containerName = process.env.CONTAINER_NAME;
	const password = process.env.PASSWORD;

	const headers = {
		'Container-Name': containerName,
		'Password': password,
		'Content-Type': 'application/json'
	};

	vscode.window.showInformationMessage('Success scan requested.');

	// try {
	// 	const response = await fetch('https://pair-api.co.kr/scan', {
	// 		method: 'POST',
	// 		headers: headers,
	// 		body: JSON.stringify({ path, language })
	// 	});
	// 	return await response.json();
	// } catch (error) {
	// 	vscode.window.showErrorMessage(`Error during scan: ${error}`);
	// }
}

// 가상 함수 - API에서 디렉토리 목록 가져오기
async function fetchDirectory(): Promise<string[]> {
	return ['path/to/dir1', 'path/to/dir2', 'path/to/dir3'];
}


// This method is called when your extension is deactivated
export function deactivate() { }
