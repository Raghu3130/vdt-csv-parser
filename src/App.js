import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CSVReader from 'react-csv-reader'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // value:"NA_Sales,JP_Sales",
      // periods: "Genre",
      // data: [],
      // // category: "Platform,Publisher"
      // category: "Platform,Publisher,Year"

      value:"",
      periods: "",
      data: [],
      // category: "Platform,Publisher"
      category: ""

    }
    this.handleDarkSideForce = this.handleDarkSideForce.bind(this);
    this.handleForce = this.handleForce.bind(this);
    this.getData = this.getData.bind(this);
  }
  handleForce(data) {
   this.setState({ data });
  }

  handleDarkSideForce(data) {
    console.log(data);
  }

   

  getData(values, period, category) {
    if(values.length  == 0 ){
        alert("Values cannot be blank, please ad values field")
        return;
    }
    const {
        data
    } = this.state;
    let parsedData = {};
    
    if ((category == "" || category.length == 0) && period) {
        parsedData = this.onlyPeriods(values, period);
    } else {
        let periodsArray = [];
        let periodIndex;
        let noPeriod = false;
        if (!period) {
            periodsArray.push({
                id: "1",
                label: "1"
            });
            noPeriod = true
        } else {
            periodIndex = data[0].findIndex(d => d.toLowerCase().trim() === period.toLowerCase().trim());

            for (let i = 1; i < data.length - 1; i++) {
                let periodExist = periodsArray.findIndex(d => d.id === data[i][periodIndex]);
                if (periodExist == -1) {
                    periodsArray.push({
                        id: data[i][periodIndex],
                        label: data[i][periodIndex]
                    });
                }
            }
        }

        let rows = this.getDataCategory(values, noPeriod, periodsArray, category, category[0], periodIndex, null, null);
        parsedData = {
            rows: rows,
            periods: periodsArray
        };
    }

    console.log(parsedData)
}



getDataCategory(values, noPeriod, periodsArray, category, categoryName, periodIndex, parentCategoryLabel, parentCategory) {
    const {
        data
    } = this.state;
    const primaryIndex = data[0].findIndex(da => da.toLowerCase().trim() === values[0].toLowerCase().trim());
    const comparisonIndex = values.length > 1 ? data[0].findIndex(da => da.toLowerCase().trim() === values[1].toLowerCase().trim()) : -1;
    const index = category.findIndex(d => d === categoryName);
    const categoryIndex = data[0].findIndex(d => d.toLowerCase().trim() === categoryName.toLowerCase().trim());
    let categoryData = [];
    let filterData = null;
    const parentIndex = parentCategoryLabel ? data[0].findIndex(d => d.toLowerCase().trim() === parentCategoryLabel.toLowerCase().trim()) : -1;

    let flags = [];
    for(let i = 1; i < data.length; i++) {

        if(data[i] == "") continue; //check for blank row

        if (flags[data[i][categoryIndex]] || (parentIndex !== -1 && data[i][parentIndex] !== parentCategory)) continue; // check for existing category 
            flags[data[i][categoryIndex]] = true;
        if (parentCategory) {
            filterData = data.filter(d => d[parentIndex] == parentCategory && d[categoryIndex] == data[i][categoryIndex]);
        } else {
            filterData = data.filter(d => d[categoryIndex] == data[i][categoryIndex]);
        }
        let primary = new Array(periodsArray.length);
        let comparison = new Array(periodsArray.length);
        let series = [];

        filterData.map(filterList => {
            periodsArray.map((period, j) => {
                if (noPeriod) {
                    primary.splice(j, 1, ((primary[j] || 0) + parseFloat(filterList[primaryIndex].replace(',', ""))));
                    if (values.length > 1) {
                        comparison.splice(j, 1, ((comparison[j] || 0) + parseFloat(filterList[comparisonIndex].replace(',', ""))));
                    }
                } else {
                    if (filterList[periodIndex] === period.id) {
                        primary.splice(j, 1, ((primary[j] || 0) + parseFloat(filterList[primaryIndex].replace(',', ""))));
                        if (values.length > 1) {
                            comparison.splice(j, 1, ((comparison[j] || 0) + parseFloat(filterList[comparisonIndex].replace(',', ""))));
                        }
                    } else {
                        primary.splice(j, 1, primary[j] || 0);
                        if (values.length > 1) {
                            comparison.splice(j, 1, comparison[j] || 0);
                        }
                    }
                }


            })

        });

        series.push(primary);
        if( values.length  > 1) {
          series.push(comparison);
        }
        
        if (noPeriod && categoryIndex == -1) {
          values.map( (value,k)=> {
            categoryData.push({
              id: value,
              label: value,
              series: [series[k],[]]
            });
          })

        } else {

          if (index == category.length - 1) {
              categoryData.push({
                  id: data[i][categoryIndex],
                  label: data[i][categoryIndex],
                  series: series
              });
          } else {
              categoryData.push({
                  id: data[i][categoryIndex],
                  label: data[i][categoryIndex],
                  series: series,
                  children: this.getDataCategory(values, noPeriod, periodsArray, category, category[index + 1], periodIndex, category[index], data[i][categoryIndex])
              });
          }
      }
    }
    return categoryData;
}

onlyPeriods(values, period) {
    const {
        data
    } = this.state;
    let primaryIndex = data[0].findIndex(da => da.toLowerCase().trim() === values[0].toLowerCase().trim());
    let comparisonIndex = values.length > 1 ? data[0].findIndex(da => da.toLowerCase().trim() === values[1].toLowerCase().trim()) : -1;
    let periodsArray = [];
    let rows = (values).map(d => {
        return {
            id: d,
            label: d,
            series: []
        }
    });
    const periodIndex = data[0].findIndex(d => d.toLowerCase().trim() === period.toLowerCase().trim());
    for (let i = 1; i < data.length - 1; i++) {
        let periodExist = periodsArray.findIndex(d => d.id === data[i][periodIndex]);
        if (periodExist == -1) {
            periodsArray.push({
                id: data[i][periodIndex],
                label: data[i][periodIndex]
            });
            rows[0].series.push(parseFloat(data[i][primaryIndex].replace(',', "")));
            if (values.length > 1) {
                rows[1].series.push(parseFloat(data[i][comparisonIndex].replace(',', "")));
            }
        } else {
            rows[0].series.splice(periodExist, 1, rows[0].series[periodExist] + parseFloat(data[i][primaryIndex].replace(',', "")));
            if (values.length > 1) {
                rows[1].series.splice(periodExist, 1, rows[1].series[periodExist] + parseFloat(data[i][comparisonIndex].replace(',', "")));
            }
        }


    }
    const parseData = {
        periods: periodsArray,
        rows
    };
    return parseData;

}
  render() {
      const { value, periods, category } = this.state;
    const values = value ? value.split(",") : [];
    const categories = category ? category.split(",") : [];
    return (
      <div style={{ width: "200px"}}>
      <div style={{display:"flex", flexDirection:"column"}}>
        <CSVReader
          cssClass="csv-reader-input"
          label="Select CSV for data parsing"
          onFileLoaded={this.handleForce}
          onError={this.handleDarkSideForce}
          inputId="ObiWan"
          inputStyle={{color: 'red'}}
        />
      <div style={{display:"flex", marginTop:"10px", paddingRight:"5px"}}> <span style={{ paddingRight:"5px"}}>Values:</span> <input  placeholder="values: write comma seperated" onChange={(e) => this.setState({value: e.target.value})}/></div>
      <div style={{display:"flex", marginTop:"10px", paddingRight:"5px"}}> <span style={{  paddingRight:"5px"}}>Period:</span> <input placeholder="Period" onChange={(e) => this.setState({periods: e.target.value})}/></div>
      <div style={{display:"flex", marginTop:"10px", paddingRight:"5px"}}> <span style={{paddingRight:"5px"}}>Category:</span><input  placeholder="Category: write comma seperated" onChange={(e) => this.setState({category: e.target.value})}/></div>
      <button  style ={{ marginTop:"10px"}} primary onClick={() => this.getData(values, periods, categories) }>Submit</button>
      </div>
      </div>
    )
  }
}

export default App;
