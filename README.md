# pre-onenote
color and format text/html to beautify OneNote

in developing... still a long way to go

格式化待粘贴到OneNote的文本

临时使用手册：www.whiteswallows.ink/preonenote/docs

仍然在改进...

## 动机

打算写个网页预处理文本样式，再复制到OneNote中，官网可见使用说明，事实上Office的ppt等等都将可以使用它做富文本样式变换。其实在WORD的替换功能里有更成熟的文本样式替换功能，但缺乏对目标样式的管理

用例一：网页的重点标记不符合主题，我们复制需要的内容粘贴进来，标记所有粗体，替换为一个主题样式，再粘贴进其它软件

|   网页教程内容    |    替换样式后的笔记示例    |
|  ----  | ----  |
| <img src="https://github.com/Mookiepiece/pre-onenote/blob/master/docs/contentFromWeb.jpg" alt="example of web content" height="250">    | <img src="https://github.com/Mookiepiece/pre-onenote/blob/master/docs/contentAfterStyleTransform.jpg" alt="web content after style tranasform" height="250"> |



用例二：网页上复制的代码块等具有背景色（background-color）。但onenote没有，用户可以用这个软件生成表格和施加表格背景色，以模拟背景色

<img src="https://github.com/Mookiepiece/pre-onenote/blob/master/docs/tableCraft.jpg" alt="use onenote tables to simulate background-color" width="50%">

## 开发随笔
20-05-17
- 从ON粘贴出来的shift+enter会转义成br

20-05-06
- 发现pre标签的fontFamily默认是monospace，要想办法覆盖它，设置成inherit，完了，office直接照搬，不论是unset,inherit,还是var(--default-font-family)
- 这也不能怪office，估计微软是很讨厌web和浏览器了（狗头）
- 样式覆盖问题本来是想开iframe就不会样式污染，顺便练习跨源通信，还是算了。最后是直接吸root的style，估计性能下降一个档次了
- 另外office列表的圈圈是能隧字体的改变而改变大小的，web无能为力
- 在VSCode里的代码，很多是 & n b s p ; 的非断行空白，改成空格符了，希望使用中不会因为nbsp出现错误，在onenote里贴过来的东西反倒是很多回车塞在tag间，在前几天写的paste.js里消除回车开头的东西了

20-05-03
- ON也不支持colgroup给table设的样式，旗鼓相当的对手
- 测试认为表格从网页粘贴到ON里，需要border-style:none;才会隐藏边框。那粘贴出来的xhtml为什么是border:0???

20-05-02
- 我已经忘了...Office不支持Alpha通道的颜色
- ON按tab追加shift+tab，可以将tab继续缩小一层，复制出来的html是ul嵌套ul，(都xhtml了居然还有这种bug)，解决方法是只看li/dt，舍弃ul/ol/dl
- list里能嵌table，但嵌了table的list不能有缩进
- 给读者：看剪贴板的方法是document.body.contentEditable=!0;document.body.onpaste=e=>console.log(new DOMParser().parseFromString(e.clipboardData.getData('text/html'),'text/html')) //slate官网有这个paste-html示例

20-04-29
- ordered-list数字不统一现象，放在一边了。因为web的list贴过去，如果想建立子项，序号样式不会后移，剪贴板不支持的话那没有办法了

20-03-30
- pre标签的vertical-align:super/sub被复制后，如果字号使用calc将继承该pre的字号，字号直接pt会生效
- h6标签的vertical-align:super/sub被复制后，如果字号使用calc将销毁，直接上onenote默认值，字号直接pt会生效

20-03-19
- 匹配功能到了一个里程碑，被匹配的文字将带有bling类，因为lock-on效果基于size，故跨行元素只能设置white-space:pre 导致其不换行
- 以后估计要开一个是否开启lock-on特效的功能，如果不开，就用background/text-shadow/box-shadow染个色就好了

20-03-18
- HTML中 span 直接打出换行符可以实现office shift+enter伪换行效果，故shift+enter快捷键应该插入一个换行符伪换行
- 直接复制伪换行会带一个br标签，应该实现复制后自动删除br

20-03-17
- 在仅存在一种样式的情况下，pre标签可以获取正确的text-align等样式,会使用其代替p标签
- 另外slate.js劫持了剪贴板使其不能直接操作富文本，需要在粘贴前将slate屏蔽

20-03-13
- 这几天在学webpack并把项目换成基于原生的electron和webpack了

20-03-03:

- nbsp的字符码是\u00A0即160，测试认为表格从网页粘贴到ON里，需要border-style:none;才会隐藏边框，哪怕是solid 0px也会显示边框，合理，因为ON的表格边框厚度无关

20-02-23：

- 项目终止了一段时间，正在重新安排,使用electron-webpack脚手架

19-08-12：

- 发现仅复制一种格式的字符时（加background），格式不会被复制，但是在pre、h1-h5标签中可以是例外，h6却不行，原理不明

19-08-09：

- 发现office不支持Alpha通道颜色，带有A通道的颜色不能复制上去

19-08-06：

- 定题
- 发现office字体在CSS中应以pt（磅/点）为单位而不是px
- 理解OneNote的复制粘贴会有优化，具体表现在
  - ①仅具有空白符的表格行列不会被粘贴=>找到了unicode字符【\u200B】占坑符，提醒ON这是有用的表格单元格（个人喜欢用空白带背景单元格做边距装饰）
  - ②如果字体颜色和字体背景色相近，ON会改变文字颜色=>没有解决办法也不需要解决
