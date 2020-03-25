# node-elm 接口文档
```

baseUrl: 

```

## 目录：

[1、获取用户信息](#1获取用户信息)<br/>



## 接口列表：

### 1、获取用户信息

#### 请求URL:  
```
https://baseUrl/web/api/login
```

#### 示例：
 [https://baseUrl/web/api/login](https://baseUrl/web/api/login)

#### 请求方式: 
```
POST
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|model      |Y       |Object |userName,password |

#### 返回示例：

```javascript
{
    _id: 000292087,
    userName: "KaydenLi",
    createdTime: "2020-02-02",
    adminFlag:false,
    welcomeFlag: true,
    address: "湖北省武汉市洪山区华中科技大学",
    phone: 157********,
    email: kaydenli@qq.com,
    avatar: "http://****/avrtar.png",
    projects_id:"",
    applyWaitProject_id: "",
    authWaitProjects_id:"",
    getAuthedProjects_id: "",
    getCheckedProjects_id: "",
}
```