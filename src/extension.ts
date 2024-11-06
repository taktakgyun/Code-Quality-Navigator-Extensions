import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const languageProvider = new LanguageProvider();
    const pathProvider = new PathProvider();
    
    vscode.window.registerTreeDataProvider('codeQualityNavigator.selectPathView', pathProvider);
    
    // "Select Path" 명령어 등록
    const selectPathCommand = vscode.commands.registerCommand('codeQualityNavigator.selectPath', async () => {
        const paths = efsPaths.map((path) => ({
            label: path,
            description: '',
        }));

        const selectedPath = await vscode.window.showQuickPick(paths, {
            placeHolder: 'Select a path for code analysis',
        });

        if (selectedPath) {
            vscode.window.showInformationMessage(`Selected path: ${selectedPath.label}`);
            pathProvider.addPath(selectedPath.label);
        }
    });

    // 언어 선택 드롭다운 메뉴 명령어 등록
    const selectLanguageCommand = vscode.commands.registerCommand('codeQualityNavigator.selectLanguage', async () => {
        const languages = ['Java', 'Python'];
        const selectedLanguage = await vscode.window.showQuickPick(languages, {
            placeHolder: 'Select the programming language for analysis'
        });
        if (selectedLanguage) {
            vscode.window.showInformationMessage(`Selected language: ${selectedLanguage}`);
            languageProvider.setSelectedLanguage(selectedLanguage);
        }
    });

    // 코드 스캔 요청 명령어 등록
    const scanCodeCommand = vscode.commands.registerCommand('codeQualityNavigator.scanCode', async () => {
        const selectedPath = pathProvider.getSelectedPath();
        const selectedLanguage = languageProvider.selectedLanguage;

        if (selectedPath && selectedLanguage) {
            await requestCodeScan(selectedPath, selectedLanguage);
            vscode.window.showInformationMessage('Code scan requested.');
        } else {
            vscode.window.showErrorMessage('Please select a path and language first.');
        }
    });

    context.subscriptions.push(selectLanguageCommand, scanCodeCommand, selectPathCommand);
    initializeTreeView(pathProvider);
}

// EFS 경로 데이터 예제 (실제 사용 시 API 호출로 데이터를 불러올 예정)
const efsPaths = [
    'efs/folder1',
    'efs/folder2',
    'efs/folder3'
];

// 언어 선택 상태 관리 클래스
class LanguageProvider {
    selectedLanguage: string | undefined;

    setSelectedLanguage(language: string) {
        this.selectedLanguage = language;
    }
}

// 경로 선택 TreeDataProvider 클래스
class PathProvider implements vscode.TreeDataProvider<PathItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<PathItem | undefined | void> = new vscode.EventEmitter<PathItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<PathItem | undefined | void> = this._onDidChangeTreeData.event;
    private selectedPaths: string[] = [];

    constructor() {}

    // 선택한 경로를 추가하는 메서드
    addPath(path: string) {
        if (!this.selectedPaths.includes(path)) {
            this.selectedPaths.push(path);
            this.refresh();
            vscode.window.setStatusBarMessage(`Path added: ${path}`, 2000);
        }
    }

    getSelectedPath(): string | undefined {
        return this.selectedPaths.length > 0 ? this.selectedPaths[0] : undefined;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PathItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PathItem): Thenable<PathItem[]> {
        const items = this.selectedPaths.map((path) => new PathItem(path, vscode.TreeItemCollapsibleState.None));
        return Promise.resolve(items);
    }
}

// TreeView 아이템 정의
class PathItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}

// TreeView 초기화 함수
function initializeTreeView(pathProvider: PathProvider) {
    vscode.window.createTreeView('codeQualityNavigator.selectPathView', {
        treeDataProvider: pathProvider,
    });
}

// 코드 스캔 요청 함수
async function requestCodeScan(path: string, language: string) {
    const containerName = process.env.CONTAINER_NAME;
    const password = process.env.PASSWORD;

    const headers = {
        'Container-Name': containerName || '',
        'Password': password || '',
        'Content-Type': 'application/json'
    };

    // 예제 요청 - 실제 사용 시 HTTP POST 요청을 여기에서 수행합니다.
    // await axios.post('https://pair-api.co.kr/scan', { path, language }, { headers });
    vscode.window.showInformationMessage(`Scan requested for path: ${path}, language: ${language}`);
}

export function deactivate() {}
