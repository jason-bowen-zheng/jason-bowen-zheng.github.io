#!/usr/bin/python3

from base64 import b64encode
import imghdr, json, os, requests, sys, time

def getsha():
    return requests.get("https://api.github.com/repos/jason-bowen-zheng/jason-bowen-zheng.github.io/contents/sources/images/lists.json").json()["sha"]

def main():
    print("正在获取图片列表... ", end="")
    try:
        images_list = requests.get("https://jason-bowen-zheng.github.io/sources/images/lists.json").json()
    except:
        print("\n图片列表获取失败")
        return
    print("共%d张图片" % len(images_list))
    name, token = "", input("GitHub令牌: ")
    print("检验令牌... ", end="")
    ret = requests.get("https://api.github.com", headers={"Authorization": "token %s" % token}).json()
    if ret.get("message") == "Bad credentials":
        print("令牌不存在")
        return
    else:
        print("完成")
    if len(sys.argv) > 1:
        name = sys.argv[1]
    else:
        name = input("文件名: ")
    if not os.path.isfile(name):
        print("文件 \"%s\" 不存在" % name)
        return
    elif imghdr.what(name) is None:
        print("文件 \"%s\" 不是图片文件" % name)
        # return
    b64str = b64encode(open(name, "rb").read()).decode()
    name = input("为图片取一个名字: ") or os.path.split(name)[-1]
    desp = input("添加一些描述: ")
    ret = requests.put("https://api.github.com/repos/jason-bowen-zheng/jason-bowen-zheng.github.io/contents/sources/images/%s" % name, 
            headers={"Authorization": "token %s" % token},
            json={
                "message": time.strftime("%Y-%m-%d(upload.py)"),
                "content": b64str
            }).json()
    if ret.get("message") != time.strftime("%Y-%m-%d(upload.py)"):
        print("错误调用GitHub API: %s" % ret["message"])
        return
    images_list.append({"name": name, "description": desp})
    content = json.dumps(images_list, indent="\t")
    ret = requests.put("https://api.github.com/repos/jason-bowen-zheng/jason-bowen-zheng.github.io/contents/sources/images/lists.json", 
            headers={"Authorization": "token %s" % token},
            json={
                "message": time.strftime("%Y-%m-%d(upload.py)"),
                "content": b64encode(content.encode()).decode(),
                "sha": getsha()
            }).json()
    if ret.get("message") != time.strftime("%Y-%m-%d(upload.py)"):
        print("错误调用GitHub API: %s" % ret["message"])
        return

if __name__ == "__main__":
    main()
