import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/fontawesome-free-solid';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showIcon: faCaretUp,
      display_add: 'none',
      dataArray: [],
      address: '',
      placeMap: [],
      clickCode: 'default',
      inputVal: ''
    };

    this.entranceClick = this.entranceClick.bind(this);
  }

  entranceClick() {
    //控制选择内容的显示隐藏
    this.setState(prevState => ({
      showIcon: prevState.showIcon === faCaretUp ? faCaretDown: faCaretUp,
      display_add: prevState.display_add === 'block' ? 'none': 'block'
    }));

    //请求服务器数据
    if (this.state.display_add === 'none' && this.state.dataArray.length === 0) {
      this.getAddressData();
    }
  }

  getAddressData() {
    axios.get('https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pcas-code.json').then((response) => {
      if (response.data.length > 0) {
        this.setState({
          dataArray: response.data
        });
      } else {
        alert("暂无数据！");
      }
    })
    .catch((error) => {
      alert("暂无数据！");
    });
  }

  getChildrenArray(code, array) {
    let result;
    array.forEach(element => {
      if (element.code === code && element.children) {
        if (element.children.length === 1) 
          result = element.children[0].children;
        else
          result = element.children;
      }
    });

    return result;
  }

  addressClick(param1, param2, event) {
    let tempData = [];
    
    if (this.state.clickCode !== "default") {
      for (let element of this.state.placeMap) {
        tempData.push(element);
        if (element.code === this.state.clickCode) {
          break;
        }
      }
    } else {
      tempData = this.state.placeMap;
    }

    if (this.getChildrenArray(param1, this.state.dataArray)) {
      tempData.push({code: param1, name: param2, children: this.getChildrenArray(param1, this.state.dataArray)});
    } else {
      if (tempData[tempData.length-1].children) {
        tempData.push({code: param1, name: param2});
      } else {
        tempData[tempData.length-1].name = param2;
      }
    }

    let addressStr = "";
    tempData.forEach(element => {
      addressStr += element.name + "-";
    });
    
    this.setState(prevState => ({
      inputVal: '',
      clickCode: 'default',
      address: addressStr.substr(0, addressStr.length-1),
      placeMap: tempData,
      dataArray: this.getChildrenArray(param1, prevState.dataArray) ? this.getChildrenArray(param1, prevState.dataArray) : prevState.dataArray
    }));

  }

  titleClick(param, event) {
    this.state.placeMap.forEach(element => {
      if (param === "default") {
        this.setState({
          inputVal: '',
          clickCode: param,
          dataArray: this.state.placeMap[this.state.placeMap.length-2].children
        });
      } else if (param === element.code) {
        this.setState(prevState => ({
          inputVal: '',
          clickCode: param,
          dataArray: element.children ? element.children : prevState.dataArray
        }));
      }
    });
  }

  handelChange(e){
    this.setState({
      inputVal: e.target.value
    })
  }

  render() {
    return (
      <div className="App">
        <div id="entranceAddress" onClick={this.entranceClick}>
          <span className="placeholder">{this.state.address ? "" : "请选择行政区域"}</span>
          <span id="clickInput">{this.state.address}</span>
          <span id="clickIcon"><FontAwesomeIcon icon={this.state.showIcon} /></span>
        </div>
        <div id="detailAddress" style={{display: this.state.display_add}}>
          <input id="searchInput" type="text" placeholder="搜索行政单位" onChange={this.handelChange.bind(this)} defaultValue={this.state.inputVal} />
          <ul id="addressDataTitle">
            { this.state.placeMap.map((element) => {return <li className={this.state.clickCode === element.code ? "chooseAddress" : ""} key={element.code} onClick={this.titleClick.bind(this, element.code)}>{element.name}</li>;} ) }
            <li className={this.state.clickCode === "default" ? "chooseAddress" : ""} onClick={this.titleClick.bind(this, "default")}>请选择</li>
          </ul>
          <ul id="addressDataContent">
            { this.state.dataArray.map((element) => {return <li key={element.code} onClick={this.addressClick.bind(this, element.code, element.name)} style={{display: element.name.indexOf(this.state.inputVal) >= 0  ? 'block' : 'none'}}>{element.name}</li>;} ) }
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
