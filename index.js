const { app, ipcMain, BrowserWindow, dialog } = require('electron')
const fs = require('fs')

let mainWin;

/**
 * ウィンドウを作成する
 */
function createWindow () {
  // ウィンドウを新たに開く
  mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // ファイルを開く
  mainWin.loadFile('public/index.html')
}

// 初期化が終了したらウィンドウを新規に作成する
app.whenReady().then(createWindow)


// すべてのウィンドウが閉じられたときの処理
app.on('window-all-closed', () => {
  // macOS以外はアプリを終了する
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// アプリがアクティブになった時の処理
// (macOSはDocのアイコンがクリックされたとき）
app.on('activate', () => {
  // ウィンドウがすべて閉じられている場合は新しく開く
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/**
 * [IPC] 指定ファイルを保存する
 *
 */
ipcMain.handle('file-save', async (event, data) => {
  // 場所とファイル名を選択
  const path = dialog.showSaveDialogSync(mainWin, {
    buttonLabel: '保存',  // ボタンのラベル
    filters: [
      { name: 'Text', extensions: ['txt', 'text'] },
    ],
    properties:[
      'createDirectory',  // ディレクトリの作成を許可 (macOS)
    ]
  });

  // キャンセルで閉じた場合
  if( path === undefined ){
    return({status: undefined});
  }

  // ファイルの内容を返却
  try {
    fs.writeFileSync(path, data);

    return({
      status: true,
      path: path
    });
  }
  catch(error) {
    return({status:false, message:error.message});
  }
});
