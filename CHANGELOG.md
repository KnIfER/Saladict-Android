# Change Log

此项目的所有显着更改将记录在此文件中。 有关提交准则，请参见 [standard-version](https://github.com/conventional-changelog/standard-version)

<a name="AlloyDict"></a>
## [伟大的开端：AlloyDict (2020-08-06)](https://github.com/name/repo-name/compare/v6.33.0...v6.33.1) 
### 准备工作
* **简化编译:**  编译时不生成.map文件。
* **暂时删除:**  削减界面文字翻译，只保留简体中文。移除繁简转换2000多行的charMap。
* **简化项目:**  移除右键菜单、插件弹窗等插件功能，去除设置页中的词典面板。
* **非破坏性:** 保留插件的大部分功能，编译完成后，仍然可以加载到浏览器中，用于观察学习。此番去除插件弹窗后，点击插件按钮，直接打开独立查词窗口。
* **前路漫漫:** 要将Saladict插件应用于普通浏览器，须转译chrome插件的API。比如消息传递，API是`chrome.runtime.onMessage.addListener`、`chrome.runtime.sendMessage`，可以翻译成这样：addListener时将监听器置入数组，sendMessage时遍历执行。具体有两种做法：要么将chrome.runtime.onMessage.addListener字符串替换为chrome.WHATEVER，然后自行定义方法属性；要么一步步组装、拟构API。后一个方法可尽量不改动源码，但是如同隔靴搔痒，无法很好地观察学习。我用的是第一个方法。无论如何选择都需要修改 public/static/browser-polyfill.min.js，完成相关的定义。（暂未上传） 

AlloyDict 基于Saladict，v6.33.2。我也尝试过用最新版作为基础，但是失败。编译慢，也试过升级typescript，但更难。现在，编译时间稳定在30~40s，算可接受。 


# Original
* **newest:** https://github.com/crimx/ext-saladict/blob/dev/CONTRIBUTING.md  
* **initial:** https://github.com/crimx/ext-saladict/blob/v6.33.2/CHANGELOG.md  
