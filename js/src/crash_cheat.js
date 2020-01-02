// <!--崩溃欺骗-->
var OriginTitile = document.title;
 var titleTime;
 document.addEventListener('visibilitychange', function () {
     if (document.hidden) {
        //  $('[rel="icon"]').attr('href', "/img/TEP.ico");
         document.title = '(..•˘_˘•..) 页面崩溃啦!';
         clearTimeout(titleTime);
     }
     else {
        //  $('[rel="icon"]').attr('href', "/favicon.ico");
         document.title = '(｡◕‿◕｡)骗你的哈哈~';
         titleTime = setTimeout(function () {
             document.title = OriginTitile;
         }, 2000);
     }
 });