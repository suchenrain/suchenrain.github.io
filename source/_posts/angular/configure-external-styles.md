---
title: 配置全局及自定义主题样式
categories:
  - Angular CLI
tags:
  - theme
  - style
license: nd
abbrlink: 1616
date: 2018-08-02 18:11:30
updated: 2018-08-02 19:26:08
---

先说问题吧。

最近在看 primeng 的源码，框架是支持主题切换的，主题样式使用 sass,主题的切换是通过动态替换全局主题 css 文件来实现的。

```
changeTheme(event: Event, theme: string) {
    let themeLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('theme-css');
    themeLink.href = 'assets/components/themes/' + theme + '/theme.css';
    event.preventDefault();
}
```

所以想知道在使用 Angular CLI 构建项目过程中这些`theme css`如何生成？ primeng 源码本身貌似是使用了 gulp,但是 Angular CLI 本身应该也可以做到，一探究竟。

Angular CLI: 6.1.1
Node: 10.7.0
OS: win32 x64
Angular:
...

通过在`angular.json`文件的项目`build`选项中配置`styles`,我们可以添加更多的全局样式：

```json
"architect": {
    "build":{
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
        "styles": [
        "node_modules/fullcalendar/dist/fullcalendar.min.css",
        "node_modules/font-awesome/css/font-awesome.min.css",
        "src/styles.css",
        { "input": "src/resources/themes/cruze/theme.scss","bundleName": "assets/themes/cruze","lazy": true }
        ],
```

其中`bundleName`指定了`input`里面的样式编译后输出的目录，如果不使用这种对象格式，则会全部一起合并打包生成`styles.js` (或者 styles.css)
`lazy: true` 表示只生成该样式，但并不引入到`index.html`文件中。否则，会自动在`index.html`中引入生成的文件。

使用 --extract-css build 或者 prod 模式则会生成.css

所以如果使用`ng run build --extract-css`, 上述配置将会把 resouces 下相应的 theme.scss 编译成 css 并放入 assets/themes 目录下。

另外一个问题，如果使用生产模式编译，最终生成的 css 会附带 hash 串。
通过`--output-hashing`可以设置输出 hash 的模式，可能的值有:

- `none`: no hashing performed
- `media`: only add hashes to files processed via [url|file]-loaders
- `bundles`: only add hashes to the output bundles
- `all`: add hashes to both media and bundles

none is the default for the development target.
all is the default for the production target.

目前想到的解决方法：在 build 完成后，使用脚本去修改名称。类似

```javascript rename.js
// rename.js file - location, right next to package.json
var fs = require('fs');
fs.rename('./dist/main.bundle.js', './dist/myproject.js');
```

和

```json package.json
"scripts":{
   "build-rename":"ng build && node rename.js"
}
```

{% tabs %}

<!-- tab first tab@heart -->

{% codeblock %}
alert('Hello World!');
{% endcodeblock %}

<!-- endtab -->
<!-- tab  second tab-->

second

<!-- endtab -->
<!-- tab  third tab-->
{% gist 796a51b5d6801ffccb90d360d9900777  %}
<!-- endtab -->

{% endtabs %}
[TO BE UPDATED IN FUTURE]

references:

1.  https://stackoverflow.com/questions/46152593/lazy-load-application-theme-styles-with-angular-cli
1.  https://github.com/angular/angular-cli/wiki/stories-global-styles
1.  https://github.com/angular/angular-cli/pull/3885
1.  https://stackoverflow.com/questions/43257694/custom-bundle-file-name-angular-cli/43258641#43258641
