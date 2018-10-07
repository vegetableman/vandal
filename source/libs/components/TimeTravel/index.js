import React from 'react';
import _ from 'lodash';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import tinycolor from 'tinycolor2';

import CalendarFilter from '../CalendarFilter';
import GraphFilter from '../GraphFilter';
import { Card } from '../Common';
import { api } from '../../utils';

import './style.css';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
];


export default class TimeTravel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedYear: null,
      selectedMonth: null,
      selectedDay: null,
      months: null,
      showCard: false,
      card: null,
      showLoader: false,
      selectedTabIndex: 0,
      selectedPoint: null,
      selectedMonthIndex: null
    };
  }

  getCalendar = async(url, year) => {
    this.setState({ showLoader: true, selectedYear: year });
    const calendarData = await api(`https://web.archive.org/__wb/calendarcaptures?url=${url}&selected_year=${year}`);
    const months = _
          .map(calendarData, (month) => (_.flatten(month).filter(Boolean)))
          .map((m, i) => (_.map(m, (mx) => ({ cnt: (mx.cnt ? mx.cnt : 0), ts: mx.ts }))))

    this.setState({ months, showLoader: false })
  }

  getColor = (day) => {
    const { months, selectedMonth } = this.state;
    const count = _.get(months, `${selectedMonth - 1}.${day - 1}.cnt`);
    if (count) {
      return { backgroundColor: tinycolor("#d8f9d4").darken(Math.min(count, 30)).toString() };   
    }
    return null;
  }

  handleCalendarChange = (date) => {
    const dateArr = _.split(date, '-');
    const selectedYear = _.parseInt(_.nth(dateArr, 0));
    const selectedMonth = _.parseInt(_.nth(dateArr, 1));
    this.setState({ selectedYear, selectedMonth, selectedDay: null });
  }

  handleGraphChange = (year) => () => {
    this.getCalendar(this.props.url, year)
  }

  handleCalendarMove = (day) => (e) => {
    if (this.state.selectedDay) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const { offsetLeft, offsetTop } = e.target;
    const { selectedMonth, months, selectedYear } = this.state;
    const date = _.get(months, `[${selectedMonth - 1}][${day - 1}]`)
    if (_.get(date, "cnt")) {
      this.setState({
        showCard: true,
        card: { x: offsetLeft + x, y: offsetTop + y + 10, ts: _.get(date, "ts"), day,  monthName: monthNames[Math.max(selectedMonth - 1, 0)],  year: selectedYear}
      })
    }
  }

  handleCalendarDayClick = (day) => () => {
    const { months, selectedMonth } = this.state;
    const count = _.get(months, `${selectedMonth - 1}.${day - 1}.cnt`);
    if (!count) return;
    this.setState({
      selectedDay: day
    });
  }

  handleCalendarLeave = () => {
    if (this.state.selectedDay) return;
    this.setState({
      showCard: false
    });
  }

  handleCardEnter = (selectedPoint, selectedMonthIndex) => () => {
    this.debouncedGraphLeave.cancel();
    this.setState({ selectedPoint, selectedMonthIndex });
  }

  handleCardLeave = () => {
    this.setState({
      showCard: false,
      selectedMonthIndex: null,
      selectedPoint: null,
      selectedDay: null
    })
  }

  handleGraphLeave = () => {
    this.setState({
      showCard: false
    })
  }

  debouncedGraphLeave = _.debounce(this.handleGraphLeave, 500)

  handleGraphMove = ({ x, y, ts, day, monthName, point, monthIndex }) => {
    this.debouncedGraphLeave.cancel();
    this.setState({
      showCard: true,
      selectedMonthIndex: null,
      selectedPoint: null,
      card: { x, y, ts, day, monthName, year: this.state.selectedYear, showTitle: true, point, monthIndex }
    })
  }

  handleTSClick = (ts) => () => {
    console.log("ts: ", ts);
    this.setState({
      selectedDay: null
    });
  }

  handleTabChange = (selectedTabIndex) => {
    this.setState({ selectedTabIndex })
  }

  componentDidUpdate(prevProps, prevState) {
    if ( !_.isNil(this.state.selectedYear) && prevState.selectedYear !== this.state.selectedYear) {
      this.getCalendar(this.props.url, this.state.selectedYear, this.state.selectedMonth);
    }
    if (this.state.selectedMonthIndex && prevState.selectedMonthIndex !== this.state.selectedMonthIndex) {
      this.debouncedGraphLeave.cancel();
    }
  }

  render() {
    const { card, showCard, showLoader, months, selectedYear, selectedTabIndex,
      selectedPoint, selectedMonthIndex, selectedDay, selectedMonth } = this.state;
    const { sparkline } = this.props;

    return (
      <div className={`vandal-timetravel ${selectedTabIndex == 1 ? "vandal-timetravel--graph": ""}`}>
        <Tabs className="vandal-timetravel__tabs" selectedTabClassName="vandal-timetravel__tab--active" onSelect={this.handleTabChange}>
          <TabList className="vandal-timetravel__tab-list">
            <Tab className="vandal-timetravel__tab vandal-timetravel__tab-calendar">Calendar</Tab>
            <Tab className="vandal-timetravel__tab vandal-timetravel__tab-graph">Graph</Tab>
          </TabList>

          <TabPanel className="vandal-timetravel__tab-panel">
            <CalendarFilter
              selectedDay={selectedDay}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onChange={this.handleCalendarChange}
              getColor={this.getColor}
              onMouseMove={this.handleCalendarMove}
              onMouseLeave={this.handleCalendarLeave}
              onClick={this.handleCalendarDayClick}
              showLoader={showLoader}
            />
            { showCard && <Card {...card} onCardLeave={this.handleCardLeave} onTsClick={this.handleTSClick}/> }
          </TabPanel>
          <TabPanel>
            <GraphFilter
              months={months}
              selectedYear={selectedYear}
              onMouseMove={this.handleGraphMove}
              onMouseLeave={this.debouncedGraphLeave}
              sparkline={sparkline} 
              onChange={this.handleGraphChange}
              showLoader={showLoader}
              selectedPoint={selectedPoint}
              selectedMonthIndex={selectedMonthIndex}
            />
          { showCard && <Card {...card} onCardEnter={this.handleCardEnter} onCardMove={this.handleCardEnter} onCardLeave={this.handleCardLeave} onTsClick={this.handleTSClick}/> }
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}