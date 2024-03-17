const db = wx.cloud.database()

Page({
  data: {
    // 本月指的是选择的当前月份
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    nowMonth: new Date().getMonth() + 1, //本月是几月
    nowDay: new Date().getDate(), //本月当天的日期
    weeksArr: ['日', '一', '二', '三', '四', '五', '六'],
    lastMonthDays: [], //上一个月
    nowMonthDays: [], //本月 
    nextMonthDays: [], //下一个月
    timeDate: new Date().toLocaleDateString(), //当前时间
    lastType: "nowMonthDays", //上一次选中的时间类型,默认为本月
    openid: '',
    missions: '',
    // copied
    userInfo: null,
    showModalStatus: false,
    category: ['学习', '工作', '生活', '其他'],
    currentCategory: -1,
    time: "",
    date: "",
    lightred_selected: false,
    lightblue_selected: false,
    lightgreen_selected: false,
    yellow_selected: false,
    puepleblue_selected: false,
    grey_selected: false,
    color_other_selected: false,
    show_diy_input_status: false,
    selected_color: '',
    ModifyStatus: false,
    // newmission
    todoName: '',
    todoDate: '',
    todoTime: '',
    todoCategory: '',
    todoColor: '546de5',
    todoNotion: '',
    // modifymission
    modifyName: '',
    modifyDate: '',
    modifyTime: '',
    modifyCategory: '',
    modifyColor: '',
    modifyNotion: '',
    lightred_modify: false,
    lightblue_modify: false,
    lightgreen_modify: false,
    yellow_modify: false,
    puepleblue_modify: false,
    grey_modify: false,
    color_other_modify: false,
    show_diy_input_modify: false,
    selected_modify: '',
    modify_diycolor: '546de5',
    modify_id: '',
    // setProcess
    setProcess: false,
    duration: 0,
    processid: '',
  },

  // 在数据库中查找数据
  getData() {

    var id = this.data.openid;
    var day= this.data.day;
    var month = this.data.month;
    if ( month>'0' && month<='9') month = '0' + month;
    if ( day>'0' && day<='9') day = '0' + day;
    var year = this.data.year;
    var date = year + '-' + month + '-' + day;

    db.collection("user_list").where({
      userid: id,
      date: date,
    }).orderBy('time', 'asc').get({
      success: res => {
        console.log(res)
        this.setData({
          missions: res.data,
        })
      }
    });
    console.log(this.data.missions);

  },

  onShow() {
    let {
      year,
      month
    } = this.data
    this.createDays(year, month)
  },

  //创建时间
  createDays(year, month) {
    this.getLastMonthDays(year, month)
    this.getNowMonthDays(year, month)
    this.getNextMonthDays(year, month)
  },

  //获取当月天数
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },

  //绘制上个月天数
  getLastMonthDays(year, month) {
    let nowMonthFirstDays = new Date(year, month - 1, 1).getDay()
    let lastMonthDays = []
    if (nowMonthFirstDays) { //判断当月的第一天是不是星期天
      //上个月显示多少天
      let lastMonthNums = month - 1 < 0 ? this.getThisMonthDays(year - 1, 12) : this.getThisMonthDays(year, month - 1); //判断是否会跨年

      //上个月从几号开始显示
      for (let i = lastMonthNums - nowMonthFirstDays + 1; i <= lastMonthNums; i++) {
        let time = new Date(year, month - 2, i).toLocaleDateString() //对应的时间
        lastMonthDays.push({
          date: i, //几号
          week: this.data.weeksArr[new Date(year, month - 2, i).getDay()], //星期几
          time,
          isNowMonthDay: ''
        });
      }
    }
    this.setData({
      lastMonthDays
    })
  },

  //绘制当月天数
  getNowMonthDays(year, month) {
    let {
      nowMonth,
      nowDay
    } = this.data
    let nowMonthDays = []
    let days = this.getThisMonthDays(year, month); //获取当月的天数
    for (let i = 1; i <= days; i++) {
      let time = new Date(year, month - 1, i).toLocaleDateString()
      nowMonthDays.push({
        date: i, //几号
        week: this.data.weeksArr[new Date(year, month - 1, i).getDay()], //星期几
        time,
        isNowMonthDay: (month == nowMonth && i == nowDay) ? "isNowMonthDay" : (i == nowDay) ? "isNotNowMonthDay" : ""
      });
    }
    this.setData({
      nowMonthDays
    })
  },

  //绘制下个月
  getNextMonthDays(year, month) {
    let {
      lastMonthDays,
      nowMonthDays,
    } = this.data
    let nextMonthDays = []
    let nextMonthNums = (lastMonthDays.length + nowMonthDays.length) > 35 ? 42 - (lastMonthDays.length + nowMonthDays.length) : 35 - (lastMonthDays.length + nowMonthDays.length) //下个月显示多少天
    let nowYear = (parseInt(month) + 1) > 12 ? year + 1 : year //下一个月的年份
    let nowMonth = (parseInt(month) + 1) > 12 ? 1 : parseInt(month) + 1 //下一个月的月份
    if (nextMonthNums) { //判断当前天数是否大于零
      for (let i = 1; i <= nextMonthNums; i++) {
        let time = new Date(year, month - 1, i).toLocaleDateString()
        nextMonthDays.push({
          date: i, //几号
          week: this.data.weeksArr[new Date(nowYear, nowMonth - 1, i).getDay()], //星期几
          time,
          isNowMonthDay: ''
        });
      }
    }
    this.setData({
      nextMonthDays
    })
    // console.log(nextMonthDays)
  },

  //切换月份
  changeMonth(e) {
    let {
      year,
      month
    } = this.data
    let type = e.currentTarget.dataset.type //类型
    if (type == 'pre') { //上一个月
      year = month - 1 > 0 ? year : year - 1
      month = month - 1 > 0 ? month - 1 : 12
    } else { //next 下个月
      year = (parseInt(month) + 1) > 12 ? year + 1 : year
      month = (parseInt(month) + 1) > 12 ? 1 : parseInt(month) + 1
    }
    this.setData({
      year,
      month,
      day: this.data.nowDay,
      lastType: "nowMonthDays", //切换月份，时间类型默认为本月
    })
    this.createDays(year, month);

    var app = getApp();
    const id = app.globalData.openid;
    var dday = this.data.day;
    var mmonth = this.data.month;
    if (mmonth > '0' && mmonth <= '9') mmonth = '0' + mmonth;
    if (dday > '0' && dday <='9') dday = '0' + dday;
    var yyear = this.data.year;
    var date = yyear + "-" + mmonth + "-" + dday;
    console.log(date);
    console.log(id);

    db.collection("user_list").where({
      userid: id,
      date: date,
    }).orderBy('time', 'asc').get({
      success: res => {
        console.log(res)
        this.setData({
          missions: res.data,
        })
        console.log(missions);
      }
    });
    console.log(this.data.missions);

  },

  //选择时间
  selectDate(e) {
    let type = e.currentTarget.dataset.type //选择的时间类型
    let index = e.currentTarget.dataset.index //选择的下标
    // console.log("选择的时间",type,index)
    let {
      lastType
    } = this.data
    //将上一次选择的时间类型的 isNowMonthDay 全改为''
    this.data[lastType]?.forEach(item => {
      item.isNowMonthDay = ''
    })
    this.data[type]?.forEach((item, idx) => {
      if (index == idx) {
        item.isNowMonthDay = (item.time == new Date().toLocaleDateString() ? "isNowMonthDay" : "isNotNowMonthDay"); //判断当前选中的日期是否是当前时间
      } else {
        item.isNowMonthDay = ''
      }
    })
    this.setData({
      [lastType]: this.data[lastType],
      [type]: this.data[type],
      lastType: type,
      day: index + 1,
    })

    var app = getApp();
    const id = app.globalData.openid;
    var day = this.data.day;
    var month = this.data.month;
    if (month > '0' && month <= '9') month = '0' + month;
    if (day > '0' && day <= '9') day = '0' + day;
    var year = this.data.year;
    var date = year + "-" + month + "-" + day;

    db.collection("user_list").where({
      userid: id,
      date: date,
    }).orderBy('time', 'asc').get({
      success: res => {
        console.log(res)
        this.setData({
          missions: res.data,
        })
        console.log(missions);
      }
    });
    console.log(this.data.missions);

  },

  // 添加待办的动画
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {

    this.setData({
      todoDate: this.data.date,
      todoTime: this.data.time,
      todoNotion: "",
      todoColor: '546de5',
      todoCategory: '',
      todoName: '',
      currentCategory: '',
      lightred_selected: false,
      lightblue_selected: false,
      lightgreen_selected: false,
      yellow_selected: false,
      puepleblue_selected: false,
      grey_selected: false,
      color_other_selected: false,
      show_diy_input_status: false,
      selected_color: '',
    });

    /* 动画部分 */
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });

    this.animation = animation;
    animation.opacity(0).rotateX(0).step();

    this.setData({
      animationData: animation.export()
    })

    setTimeout(function () {
      animation.opacity(1).rotateX(0).step();
      this.setData({
        animationData: animation.export()
      })

      //关闭  
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  },

  // 新的待办 —— 颜色
  diy_input: function (e) {
    console.log("diy_input function called");
    var currentStatu = e.currentTarget.dataset.statu;
    this.util_diy_input(currentStatu)
  },
  util_diy_input: function (currentStatu) {
    console.log("current status is: ");
    console.log(currentStatu);
    if (currentStatu == "open_diy") {
      this.setData({
        lightred_selected: false,
        lightblue_selected: false,
        lightgreen_selected: false,
        yellow_selected: false,
        puepleblue_selected: false,
        grey_selected: false,
        color_other_selected: true,
        show_diy_input_status: true,
        selected_color: '自定义',
      });
    }
    if (currentStatu == "lightred") {
      this.setData({
        lightred_selected: true,
        lightblue_selected: false,
        lightgreen_selected: false,
        yellow_selected: false,
        puepleblue_selected: false,
        grey_selected: false,
        color_other_selected: false,
        show_diy_input_status: false,
        selected_color: '红色',
        todoColor: 'ff7675',
      });
    }
    if (currentStatu == "lightblue") {
      this.setData({
        lightred_selected: false,
        lightblue_selected: true,
        lightgreen_selected: false,
        yellow_selected: false,
        puepleblue_selected: false,
        grey_selected: false,
        color_other_selected: false,
        show_diy_input_status: false,
        selected_color: '蓝色',
        todoColor: '74b9ff',
      });
    }
    if (currentStatu == "lightgreen") {
      this.setData({
        lightred_selected: false,
        lightblue_selected: false,
        lightgreen_selected: true,
        yellow_selected: false,
        puepleblue_selected: false,
        grey_selected: false,
        color_other_selected: false,
        show_diy_input_status: false,
        selected_color: '绿色',
        todoColor: '10ac84',
      });
    }
    if (currentStatu == "yellow") {
      this.setData({
        lightred_selected: false,
        lightblue_selected: false,
        lightgreen_selected: false,
        yellow_selected: true,
        puepleblue_selected: false,
        grey_selected: false,
        color_other_selected: false,
        show_diy_input_status: false,
        selected_color: '黄色',
        todoColor: 'fdcb6e',
      });
    }
    if (currentStatu == "purpleblue") {
      this.setData({
        lightred_selected: false,
        lightblue_selected: false,
        lightgreen_selected: false,
        yellow_selected: false,
        puepleblue_selected: true,
        grey_selected: false,
        color_other_selected: false,
        show_diy_input_status: false,
        selected_color: '紫色',
        todoColor: 'a29bfe',
      });
    }
    if (currentStatu == "grey") {
      this.setData({
        lightred_selected: false,
        lightblue_selected: false,
        lightgreen_selected: false,
        yellow_selected: false,
        puepleblue_selected: false,
        grey_selected: true,
        color_other_selected: false,
        show_diy_input_status: false,
        selected_color: '灰色',
        todoColor: '636e72',
      });
    }
  },

  // 检查输入变化并保存
  inputChange: function (e) {
    const {
      name
    } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [name]: value
    });
    console.log(name);
    console.log("change to");
    console.log(value);
  },

  // 数据库里添加数据（输入检查）
  addmission: function () {

    const todoName = this.data.todoName;
    const todoNotion = this.data.todoNotion;
    const color = this.data.todoColor;
    const todoCategory = this.data.todoCategory;
    let red = parseInt(color.substring(0, 2), 16);
    let green = parseInt(color.substring(2, 4), 16);
    let blue = parseInt(color.substring(4, 6), 16);
    console.log("ADD ITEM red= ");
    console.log(red);


    if (!todoName) {
      wx.showToast({
        title: '待办名称不能为空',
        icon: 'none'
      });
      return;
    }

    if (!todoCategory) {
      wx.showToast({
        title: '请选择待办类别',
        icon: 'none'
      });
      return;
    }

    if (todoName.length > 12) {
      wx.showToast({
        title: '待办名称不能超过12个字符',
        icon: 'none'
      });
      return;
    }

    if (todoNotion && todoNotion.length > 16) {
      wx.showToast({
        title: '备注不能超过16个字符',
        icon: 'none'
      });
      return;
    }

    const formData = {
      name: this.data.todoName,
      userid: this.data.openid,
      date: this.data.todoDate,
      time: this.data.todoTime,
      category: this.data.category[this.data.currentCategory],
      color: this.data.todoColor,
      notion: this.data.todoNotion,
      red: red,
      green: green,
      blue: blue,
      process: 0,
    };

    // 添加记录
    db.collection('user_list').add({
      data: formData,
      success: function (res) {
        console.log('添加待办事项成功', res);
        wx.showToast({
          title: '添加待办事项成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (err) {
        // 添加失败
        console.error('添加待办事项失败', err);
        wx.showToast({
          title: '添加待办事项失败',
          icon: 'none',
          duration: 2000
        });
      }
    });

    this.setData({
      showModalStatus: false
    });

    this.getData();

  },

  // （添加功能）取消按键
  cancelAction: function () {
    this.setData({
      showModalStatus: false
    });
  },

  // 类别下拉框
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      todoCategory: e.detail.value,
      currentCategory: e.detail.value,
    })
  },

  // 时间下拉框
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      todoTime: e.detail.value
    })
  },

  // 日期下拉框
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      todoDate: e.detail.value
    })
  },

  // 修改待办的动画
  modifyMission(event) {
    const mission = event.currentTarget.dataset.item;
    var currentStatu = event.currentTarget.dataset.statu;
    var modifyid = mission._id;
    var modifyColor = mission.color;
    console.log("mission id is: ");
    console.log(mission._id);

    var category;
    if (mission.category == "学习") category = 0;
    else if (mission.category == "工作") category = 1;
    else if (mission.category == "生活") category = 2;
    else category = 3;

    console.log('原待办内容：', mission);

    if (mission.color == "a29bfe") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: true,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '紫色',
      });
    } else if (mission.color == "74b9ff") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: true,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '蓝色',
      });
    } else if (mission.color == "ff7675") {
      this.setData({
        lightred_modify: true,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '红色',
      });
    } else if (mission.color == "fdcb6e") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: true,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '黄色',
      });
    } else if (mission.color == "636e72") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: true,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '灰色',
      });
    } else if (mission.color == "10ac84") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: true,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '绿色',
      });
    } else {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: true,
        show_diy_input_modify: true,
        selected_modify: '自定义',
        modify_diycolor: mission.color,
      });
    }

    this.setData({
      modifyName: mission.name,
      modifyDate: mission.date,
      modifyTime: mission.time,
      modifyCategory: category,
      modifyNotion: mission.notion,
      modifyColor: modifyColor,
      modify_id: modifyid,
    });

    /* 动画部分 */
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });

    this.animation = animation;
    animation.opacity(0).rotateX(0).step();

    this.setData({
      animationData: animation.export()
    })

    setTimeout(function () {
      animation.opacity(1).rotateX(0).step();
      this.setData({
        animationData: animation.export()
      })

      //关闭  
      if (currentStatu == "close") {
        this.setData({
          ModifyStatus: false
        });
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData({
        ModifyStatus: true
      });
    }

  },

  setProcess: function (event) {
    const mission = event.currentTarget.dataset.item;
    var process = mission.process;
    var currentStatu = event.currentTarget.dataset.statu;
    var processid = mission._id;


    /* 动画部分 */
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });

    this.animation = animation;
    animation.opacity(0).rotateX(0).step();

    this.setData({
      animationData: animation.export(),
      processid: processid,
      duration: process,
    })

    setTimeout(function () {
      animation.opacity(1).rotateX(0).step();
      this.setData({
        animationData: animation.export()
      })

      //关闭  
      if (currentStatu == "close") {
        this.setData({
          setProcess: false
        });
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData({
        setProcess: true
      });
    }

  },

  // 提交进度
  submitProcess: function () {

    var missionid = this.data.processid;
    var process = this.data.duration;

    // 修改记录
    db.collection('user_list').doc(missionid).update({
      data: {
        process: process,
      },
      success: function (res) {
        console.log('修改待办成功', res);
        wx.showToast({
          title: '修改待办成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (err) {
        // 添加失败
        console.error('修改待办失败', err);
        wx.showToast({
          title: '修改待办失败',
          icon: 'none',
          duration: 2000
        });
      }
    });


    this.setData({
      setProcess: false
    });

    setTimeout(() => {
      this.getData();
    }, 100);
  },

  cancel_setProcess() {
    this.setData({
      setProcess: false
    });

    setTimeout(() => {
      this.getData();
    }, 100);
  },

  durationChange(e) {
    this.setData({
      duration: e.detail.value
    })
  },

  // 修改待办的取消按钮
  cancelAction_modify: function () {
    this.setData({
      ModifyStatus: false
    });
  },

  // （修改待办）确认提交  
  submitModify: function () {

    const modifyName = this.data.modifyName;
    const modifyNotion = this.data.modifyNotion;
    const missionid = this.data.modify_id;

    if (!modifyName) {
      wx.showToast({
        title: '待办名称不能为空',
        icon: 'none'
      });
      return;
    }

    if (modifyName.length > 12) {
      wx.showToast({
        title: '待办名称不能超过12个字符',
        icon: 'none'
      });
      return;
    }

    if (modifyNotion && modifyNotion.length > 16) {
      wx.showToast({
        title: '备注不能超过16个字符',
        icon: 'none'
      });
      return;
    }

    var color = this.data.modifyColor;
    let red = parseInt(color.substring(0, 2), 16);
    let green = parseInt(color.substring(2, 4), 16);
    let blue = parseInt(color.substring(4, 6), 16);

    const formData = {
      name: this.data.modifyName,
      date: this.data.modifyDate,
      time: this.data.modifyTime,
      category: this.data.category[this.data.modifyCategory],
      color: this.data.modifyColor,
      notion: this.data.modifyNotion,
      red: red,
      green: green,
      blue: blue,
    };

    console.log("the new mission is: ")
    console.log(formData);

    // 修改记录
    db.collection('user_list').doc(missionid).update({
      data: formData,
      success: function (res) {
        console.log('修改待办成功', res);
        wx.showToast({
          title: '修改待办成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (err) {
        // 添加失败
        console.error('修改待办失败', err);
        wx.showToast({
          title: '修改待办失败',
          icon: 'none',
          duration: 2000
        });
      }
    });

    this.setData({
      ModifyStatus: false
    });

    setTimeout(() => {
      this.getData();
    }, 100);
  },

  // （修改待办）删除记录  
  deleteList: function () {

    const missionid = this.data.modify_id;

    console.log("the mission id is: ")
    console.log(missionid);

    // 删除
    db.collection('user_list').doc(missionid).remove({
      success: function (res) {
        console.log('删除待办成功', res);
        wx.showToast({
          title: '删除待办成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (err) {
        // 删除失败
        console.error('删除待办失败', err);
        wx.showToast({
          title: '删除待办失败',
          icon: 'none',
          duration: 2000
        });
      }
    });

    this.setData({
      ModifyStatus: false
    });

    setTimeout(() => {
      this.getData();
    }, 100);
  },

  // 修改待办 —— 颜色
  diy_input_modify: function (e) {
    console.log("diy_input_modify function called");
    var currentStatu = e.currentTarget.dataset.statu;
    this.util_diy_input_modify(currentStatu)
  },
  util_diy_input_modify: function (currentStatu) {
    console.log("current status is: ");
    console.log(currentStatu);
    if (currentStatu == "open_diy") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: true,
        show_diy_input_modify: true,
        selected_modify: '自定义',
      });
    }
    if (currentStatu == "lightred") {
      this.setData({
        lightred_modify: true,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '红色',
        modifyColor: 'ff7675',
      });
    }
    if (currentStatu == "lightblue") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: true,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '蓝色',
        modifyColor: '74b9ff',
      });
    }
    if (currentStatu == "lightgreen") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: true,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '绿色',
        modifyColor: '10ac84',
      });
    }
    if (currentStatu == "yellow") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: true,
        puepleblue_modify: false,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '黄色',
        modifyColor: 'fdcb6e',
      });
    }
    if (currentStatu == "purpleblue") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: true,
        grey_modify: false,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '紫色',
        modifyColor: 'a29bfe',
      });
    }
    if (currentStatu == "grey") {
      this.setData({
        lightred_modify: false,
        lightblue_modify: false,
        lightgreen_modify: false,
        yellow_modify: false,
        puepleblue_modify: false,
        grey_modify: true,
        color_other_modify: false,
        show_diy_input_modify: false,
        selected_modify: '灰色',
        modifyColor: '636e72',
      });
    }
  },

  bindPickerChange_modify: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      modifyCategory: e.detail.value,
      modifyCategory: e.detail.value,
    })
  },

  // 时间下拉框
  bindTimeChange_modify: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      modifyTime: e.detail.value
    })
  },

  // 日期下拉框
  bindDateChange_modify: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      modifyDate: e.detail.value
    })
  },


  onLoad(options) {

    var day = this.data.day;
    var month = this.data.month;
    if (month > '0' && month <= '9') month = '0' + month;
    if (day > '0' && day <= '9') day = '0' + day;
    var year = this.data.year;
    var date = year + "-" + month + "-" + day;

    var app = getApp();
    var userinfo = app.globalData.userInfo;

    this.setData({
      openid: getApp().globalData.openid,
      date: date,
      userInfo: userinfo,
    });

    var date = new Date();
    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

    var time = h + ":" + m;

    this.setData({
      time: time,
      todoTime: time,
    });

    this.getData();
  },



})