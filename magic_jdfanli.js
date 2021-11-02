// noinspection DuplicatedCode

/*
* 38 8 * * * m_jx_cfd_coin.js
* */
const { Env } = require('./magic');
const $ = new Env('M饭粒任务');

$.logic = async function (m) {
    $.m = m;
    let re = await getTaskFinishCount();
    if (JSON.stringify(re) == "{}") {
        console.log("获取个人信息数据错误")
        return;
    }
    if (re.finishCount === re.maxTaskCount) {
        console.log("已完成全部任务")
        return;
    }
    let loopTimes = re.maxTaskCount - re.finishCount
    console.log(`已完成${re.finishCount}次 - 总计可完成${re.maxTaskCount}次 - 还需完成${loopTimes}次\n`)
    for (let i = 0; i < loopTimes; i++) {
        console.log(`开始第${i + 1}次`)
        let taskList = await getTaskList();
        if (JSON.stringify(taskList) == "{}") {
            console.log("获取任务列表数据错误")
            continue;
        }
        let task = taskList[0]
        for (let i = 1; i < taskList.length; i++) {
            if (!task.taskId) {
                task = taskList[i]
                continue
            }
            if (taskList[i].rewardBeans > task.rewardBeans) {
                task = taskList[i]
            }
        }
        if (!task.taskId) {
            console.log("没有找到可继续进行的任务，结束")
            return;
        }
        let data = await saveTaskRecord(task.taskId, task.taskType);
        console.log(`等待${task.watchTime}秒`)
        await $.wait(task.watchTime * 1000 + 100, (task.watchTime + 1) * 1000)
        if (JSON.stringify(data) == "{}") {
            console.log("做任务失败")
            continue;
        }
        let record = await saveTaskRecord(task.taskId, task.taskType, data.uid, data.tt)
        await $.wait(2000, 3000)
        if (JSON.stringify(record) == "{}") {
            console.log("获取奖励失败")
            continue;
        }
        console.log(`${record.msg}\n`)
    }
}
$.run({ wait: [1000, 1500] }).catch(reason => console.log(reason));


//
/**
 * Safari ifanli
 *
 * {"code":1,"msg":null,"content":[{"taskName":"直播下单更优惠","taskType":1,"taskId":113,"businessId":5548104,"jumpUrl":"https://lives.jd.com/#/5548104/replay?appid=&origin=118","status":2,"statusName":"去赚钱","watchTime":8,"rewardBeans":2},{"taskName":"种草专区","taskType":2,"taskId":112,"businessId":246528834,"jumpUrl":"https://h5.m.jd.com/active/faxian/video/index.html?style=2&des=VideoImmersion&adid=&referpageid=MvideoDetail&playtype=65&projectid=&modeid=1&entrance=1&origin=jdfanli&id=246528834","status":0,"statusName":"去赚钱","watchTime":8,"rewardBeans":2},{"taskName":"去逛逛好货会场","taskType":3,"taskId":3,"businessId":null,"jumpUrl":"https://pro.m.jd.com/mall/active/ieqDLHUodjb59dqysi1GEoZ67o2/index.html","status":3,"statusName":"去赚钱","watchTime":8,"rewardBeans":2},{"taskName":"精选好物","taskType":4,"taskId":10026084864879,"businessId":10026084864879,"jumpUrl":"http://ifanli.m.jd.com/rebate/jump/toItemDetail?skuId=10026084864879","status":1,"statusName":"去赚钱","watchTime":8,"rewardBeans":5}]}
 */
// noinspection DuplicatedCode
async function getTaskList() {
    let body = encodeURIComponent(``);
    let headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://ifanli.m.jd.com/rebate/earnBean.html',
        'Host': 'ifanli.m.jd.com',
        'Cache-Control': 'no-cache',
        'Accept-Language': 'zh-cn'
    }
    let url = `https://ifanli.m.jd.com/rebateapi/task/getTaskList`
    headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1`
    let data = await $.get(url, headers)
    //console.log(JSON.stringify(data))
    if (data?.code === 1) {
        return data?.content
    } else {
        console.log(`${$.getQueryString(body, "functionId")}`,
            JSON.stringify(data))
    }
    return {};
}

async function saveTaskRecord(taskId, taskType, uid, tt) {
    let body;
    if (uid) {
        body = { "taskId": taskId, "taskType": taskType, "uid": uid, "tt": tt };
    } else {
        body = { "taskId": taskId, "taskType": taskType };
    }

    let headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://ifanli.m.jd.com/rebate/earnBean.html',
        'Host': 'ifanli.m.jd.com',
        'Origin': 'https://ifanli.m.jd.com',
        'Cache-Control': 'no-cache',
        'Accept-Language': 'zh-cn'
    }
    headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 JDFanli/2.0.20 jd.fanli/2.0.20`
    let data = await $.post(
        'https://ifanli.m.jd.com/rebateapi/task/saveTaskRecord', body, headers)
    // noinspection DuplicatedCode
    //console.log(JSON.stringify(data))
    if (data?.code === 1) {
        return data?.content;
    } else {
        console.log(`${$.getQueryString(body, "functionId")}`,
            JSON.stringify(data))
    }
    return {};
}

/**
 * Safari ifanli
 *
 * {"code":1,"msg":null,"content":{"finishCount":0,"maxTaskCount":4}}
 */
// noinspection DuplicatedCode
async function getTaskFinishCount() {
    let headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://ifanli.m.jd.com/rebate/earnBean.html',
        'Host': 'ifanli.m.jd.com',
        'Cache-Control': 'no-cache',
        'Accept-Language': 'zh-cn'
    }
    let url = `https://ifanli.m.jd.com/rebateapi/task/getTaskFinishCount?`
    headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1`
    let data = await $.get(url, headers)
    //console.log(JSON.stringify(data))
    if (data?.code === 1) {
        return data?.content
    } else {
        console.log(`${$.getQueryString(body, "functionId")}`,
            JSON.stringify(data))
    }
    return {};
}