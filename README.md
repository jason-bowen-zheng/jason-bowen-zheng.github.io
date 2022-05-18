# 鄙人的主页
![build status](https://github.com/jason-bowen-zheng/jason-bowen-zheng.github.io/actions/workflows/main.yml/badge.svg)

这是一个博客网站，从零开始一行一行敲出来的，[访问之](https://jason-bowen-zheng.github.io)查看效果。

由于没有使用Jekyll，源代码提交上去后过一会儿就会部署完成，不需要过多等待。

博客的搜索功能需要使用一个缓存文件，您可以在提交前运行`update-cache.js`创建缓存：

```shell
node update-cache.js
```

**或者**使用GitHub Action进行自动部署。
> 您可以编辑[配置文件](https://github.com/jason-bowen-zheng/jason-bowen-zheng.github.io/blob/master/.github/workflows/main.yml)进行自定义。
