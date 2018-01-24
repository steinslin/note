# 笔记

## session和cookie

- cookie保存于浏览器端 session保存于服务器端

- cookie的安全性比session弱，别人可以本地分析cookie，修改进行cookie欺骗

- session会一段时间内保存在服务器，访问增多时，会占用服务器资源

- cookie的大小上限为4k

## cookie、localStorage和sessionStorage

- webStorage的上限大小为5M,cookie为4k

- cookie会随着请求发送到服务器，webStorage不会

- cookie有自己的生命周期，过期会自动消失，localStorage是永久保存，除非用户自己清除，sessionStorage是会话存储，只保存在当前标签页面中，刷新页面数据依旧存在，但是新建一个完全相同的标签页面，不能享有数据。当标签页关闭时，sessionStorage消失
