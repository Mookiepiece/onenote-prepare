# pre-onenote
webpages to format and preprocess texts to make better OneNote

格式化待粘贴到OneNote的文本，方便美化OneNote



## 动机

个人写过自认为不丑的OneNote笔记，习惯在笔记中套用自己的格式（标题，内容，代码格式等等），但是OneNote for Windows10 中还是暂时不支持自定义格式化，故打算写个网页预处理文本，再复制到OneNote中，更方便我自己打造出美观的笔迹



## 开发计划

项目定题时间：8月6日

预计项目 Draft 版截止时间：8月20日

使用的技术：React，Webpack



## 开发日志

08-06：

- 定题
- 发现office字体在CSS中应以pt（磅/点）为单位而不是px
- 理解OneNote的复制粘贴会有优化，具体表现在
  - ①仅具有空白符的表格行列不会被粘贴=>找到了unicode字符【\u200B】占着茅坑鸟不拉屎符，提醒ON这是有用的表格单元格（我个人喜欢用空白带背景单元格做边距装饰）
  - ②如果字体颜色和字体背景色相近，ON会改变文字颜色=>没有解决办法也不需要解决

08-09：

- 发现office不支持Alpha通道颜色，带有A通道的颜色不能复制上去

08-12：

- 发现仅复制一种格式的字符时（我是加background），格式不会被复制，但是在pre、h1-h5标签中可以是例外，h6却不行，原理不明

