# pre-onenote
webpages to format and preprocess texts to make better OneNote

格式化待粘贴到OneNote的文本

## 动机

个人写过自认为不丑的OneNote笔记，习惯在笔记中套用自己的一套格式，但是OneNote for Windows10 中还是暂时不支持自定义格式化，故打算写个网页预处理文本样式，再复制到OneNote中

## 开发日志

20-02-23：

- 项目终止了一段时间，正在重新安排,使用electron-webpack脚手架

19-09-11：

- 使用typescript, 关于这个编辑器的key一直是难题，key经常会重复，一个办法是利用子元素的innerHTML做key

19-08-12：

- 发现仅复制一种格式的字符时（我是加background），格式不会被复制，但是在pre、h1-h5标签中可以是例外，h6却不行，原理不明

19-08-09：

- 发现office不支持Alpha通道颜色，带有A通道的颜色不能复制上去

19-08-06：

- 定题
- 发现office字体在CSS中应以pt（磅/点）为单位而不是px
- 理解OneNote的复制粘贴会有优化，具体表现在
  - ①仅具有空白符的表格行列不会被粘贴=>找到了unicode字符【\u200B】占着茅坑鸟不拉屎符，提醒ON这是有用的表格单元格（我个人喜欢用空白带背景单元格做边距装饰）
  - ②如果字体颜色和字体背景色相近，ON会改变文字颜色=>没有解决办法也不需要解决
