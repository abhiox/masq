import React, { useState, useEffect } from "react";
import { useToasts } from 'react-toast-notifications';
const storage = window.require('electron-json-storage');

export default function InitialSetup(props) {
  const [totalBarracks, setTotalBarracks] = useState(0);
  const [totalVacancies, setTotalVacancies] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [quarantineDays, setQuarantineDays] = useState('');
  const [initialSetup, setInitialSetup] = useState({
    nameOfFacility: '',
    barracks: [{ name: '', vacancy: '', occupied: 0, occnDate: '' }],
    dependentUnits: [{ name: '', vacAllot: '' }]
  });

  useEffect(() => {
    if ('initialSetup' in props.initialSetup) {
      let data = props.initialSetup;
      setInitialSetup(data.initialSetup);
      setTotalBarracks(data.totalBarracks);
      setTotalUnits(data.totalUnits);
      setTotalVacancies(data.totalVacancies);
      setQuarantineDays(data.quarantineDays);
    }
  }, [props.initialSetup]);

  useEffect(() => {
    let length = 0, vacancies = 0;
    initialSetup.barracks.forEach(barrack => {
      if (barrack.name.length) {
        length++;
      }
      if (barrack.vacancy) {
        vacancies = vacancies + parseInt(barrack.vacancy);
      }
    });

    setTotalBarracks(length);
    setTotalVacancies(vacancies);
  }, [initialSetup.barracks]);

  useEffect(() => {
    let length = 0;
    initialSetup.dependentUnits.forEach(unit => unit.name.length ? length++ : null)
    setTotalUnits(length);
  }, [initialSetup.dependentUnits]);

  const handleChange = (e, index, fieldName, key) => {
    let setupState = { ...initialSetup };
    setupState[fieldName] = [...setupState[fieldName]];
    setupState[fieldName][index] = { 
      ...setupState[fieldName][index], //in case if name is added already and vac not added and vice versa 
      [key]: e.target.value 
    };

    setInitialSetup(setupState);
  }

  const addMore = type => {
    let setupState = { ...initialSetup };
    if (type === 'barracks') {
      setupState[type].push({ name: '', vacancy: '', occupied: 0, occnDate: '' });
    } else if (type === 'dependentUnits') {
      setupState[type].push({ name: '', vacAllot: '' });
    }

    setInitialSetup(setupState);
  }

  const deleteState = (index, type) => {
    let setupState = { ...initialSetup };
    if(type === 'barracks' && setupState[type][index].occupied){
      showToast(`This barrack is already assigned to ${setupState[type][index].occupied} people!`, 'warning');
    }else{
      setupState[type].splice(index, 1);
      setInitialSetup(setupState);
    }
  }

  const { addToast } = useToasts();
  const saveSetup = () => {
    storage.set('initialSetup', { initialSetup, totalBarracks, totalUnits, totalVacancies, quarantineDays }, function (error) {
      let appearance, msg;
      if (error){
        appearance = 'warning';
        msg = 'Error occured while saving changes!'
      }else{
        appearance = 'success';
        msg = 'Changes saved successfully!'
      } 
      showToast(msg, appearance);
    });
  }

  const showToast = (msg, appearance) => {
    addToast(msg, {
      appearance,
      autoDismiss: true,
    });
  }

  return (
    <div className="setup-form">
      <div className="input-div">
        <label>NAME OF THE FACILITY</label>
        <div className="input-right">
          <input
            type="text"
            value={initialSetup.nameOfFacility}
            onChange={e => setInitialSetup({ ...initialSetup, nameOfFacility: e.target.value })}
          />
        </div>
      </div>
      <div className="input-div">
        <label>TOTAL BARRACKS</label>
        <div className="input-right">{totalBarracks}</div>
      </div>
      <div className="input-div">
        <label>TOTAL VACANCIES</label>
        <div className="input-right">{totalVacancies}</div>
      </div>
      <div className="input-div">
        <label>TOTAL DEPENDENT UNITS</label>
        <div className="input-right">{totalUnits}</div>
      </div>
      <div className="input-div">
        <label>NAME OF THE BARRACK &amp; NO OF VACANCY</label>
        <div className="input-right">
          <div className="noOfInputs">
            {
              initialSetup.barracks.map((barrack, index) => {
                return (
                  <div className="input-inner" key={`barrack-${index}`}>
                    <input
                      type="text"
                      onChange={e => handleChange(e, index, 'barracks', 'name')}
                      className="barrack-name"
                      value={barrack.name}
                    />
                    <input
                      type="number"
                      onChange={e => handleChange(e, index, 'barracks', 'vacancy')}
                      className="barrack-vacancy"
                      value={barrack.vacancy}
                    />
                    {
                      initialSetup.barracks.length > 1 &&
                      <div
                        className="icon-button cross"
                        onClick={() => deleteState(index, 'barracks')}
                        title="Remove Barrack"
                      >x</div>
                    }
                  </div>
                )
              })
            }
          </div>
          <div
            className="icon-button add"
            onClick={() => addMore('barracks')}
          >+Add Barrack</div>
        </div>
      </div>
      <div className="input-div">
        <label>NAME OF DEPENDENT UNITS &amp; VACANCY ALLOTMENT</label>
        <div className="input-right">
          <div className="noOfInputs">
            {
              initialSetup.dependentUnits.map((unit, index) => {
                return (
                  <div className="input-inner" key={`unit-${index}`}>
                    <input
                      type="text"
                      onChange={e => handleChange(e, index, 'dependentUnits', 'name')}
                      className="barrack-name"
                      value={unit.name}
                    />
                    <input
                      type="number"
                      onChange={e => handleChange(e, index, 'dependentUnits', 'vacAllot')}
                      className="barrack-vacancy"
                      value={unit.vacAllot}
                    />
                    {
                      initialSetup.dependentUnits.length > 1 &&
                      <div
                        className="icon-button cross"
                        onClick={() => deleteState(index, 'dependentUnits')}
                        title="Remove Unit"
                      >x</div>
                    }
                  </div>
                )
              })
            }
          </div>
          <div className="icon-button add" onClick={() => addMore('dependentUnits')}>+Add Unit</div>
        </div>
      </div>
      <div className="input-div">
        <label>NUMBER OF QUARANTINE DAYS</label>
        <div className="input-right">
          <input
            type="number"
            value={quarantineDays}
            onChange={e => setQuarantineDays(e.target.value)}
          />
        </div>
      </div>
      <div className="icon-button save-form" onClick={() => saveSetup()}>Save</div>
    </div>
  );
}
