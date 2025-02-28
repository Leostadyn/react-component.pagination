/* eslint react/prop-types: 0 */
import React from 'react';
import KEYCODE from './KeyCode';

interface Props {
  disabled: boolean;
  locale: any;
  rootPrefixCls: string;
  selectPrefixCls: string;
  current: number;
  pageSize: number;
  pageSizeOptions: (string | number)[];
  goButton: boolean | string;
  changeSize: (size: number) => void;
  quickGo: (value: number) => void;
  buildOptionText?: (value: string | number) => string;
  selectComponentClass: React.ComponentType<any> & {
    Option?: React.ComponentType<any>;
  };
}

interface State {
  goInputText: string;
}

class Options extends React.Component<Props, State> {
  static defaultProps = {
    pageSizeOptions: ['10', '20', '50', '100'],
  };

  state = {
    goInputText: '',
  };

  getValidValue = () => {
    const { goInputText } = this.state;
    // eslint-disable-next-line no-restricted-globals
    return !goInputText || Number.isNaN(goInputText)
      ? undefined
      : Number(goInputText);
  };

  buildOptionText = (value: string) =>
    `${value} ${this.props.locale.items_per_page}`;

  changeSize = (value: number) => {
    this.props.changeSize(Number(value));
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ goInputText: e.target.value });
  };

  handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const { goButton, quickGo, rootPrefixCls } = this.props;
    const { goInputText } = this.state;
    if (goButton || goInputText === '') {
      return;
    }
    this.setState({ goInputText: '' });
    if (
      e.relatedTarget &&
      (e.relatedTarget.className.indexOf(`${rootPrefixCls}-item-link`) >= 0 ||
        e.relatedTarget.className.indexOf(`${rootPrefixCls}-item`) >= 0)
    ) {
      return;
    }
    quickGo(this.getValidValue());
  };

  go = (e: any) => {
    const { goInputText } = this.state;
    if (goInputText === '') {
      return;
    }
    if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
      this.setState({ goInputText: '' });
      this.props.quickGo(this.getValidValue());
    }
  };

  getPageSizeOptions() {
    const { pageSize, pageSizeOptions } = this.props;
    if (
      pageSizeOptions.some(
        (option) => option.toString() === pageSize.toString(),
      )
    ) {
      return pageSizeOptions;
    }
    return pageSizeOptions.concat([pageSize.toString()]).sort((a, b) => {
      // eslint-disable-next-line no-restricted-globals
      const numberA = Number.isNaN(Number(a)) ? 0 : Number(a);
      // eslint-disable-next-line no-restricted-globals
      const numberB = Number.isNaN(Number(b)) ? 0 : Number(b);
      return numberA - numberB;
    });
  }

  render() {
    const {
      pageSize,
      locale,
      rootPrefixCls,
      changeSize,
      quickGo,
      goButton,
      selectComponentClass,
      buildOptionText,
      selectPrefixCls,
      disabled,
    } = this.props;
    const { goInputText } = this.state;
    const prefixCls = `${rootPrefixCls}-options`;
    const Select = selectComponentClass;
    let changeSelect = null;
    let goInput = null;
    let gotoButton = null;

    if (!changeSize && !quickGo) {
      return null;
    }

    const pageSizeOptions = this.getPageSizeOptions();

    if (changeSize && Select) {
      const options = pageSizeOptions.map((opt, i) => (
        <Select.Option key={i} value={opt.toString()}>
          {(buildOptionText || this.buildOptionText)(opt)}
        </Select.Option>
      ));

      changeSelect = (
        <Select
          disabled={disabled}
          prefixCls={selectPrefixCls}
          showSearch={false}
          className={`${prefixCls}-size-changer`}
          optionLabelProp="children"
          popupMatchSelectWidth={false}
          value={(pageSize || pageSizeOptions[0]).toString()}
          onChange={this.changeSize}
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
          aria-label={locale.page_size}
          defaultOpen={false}
        >
          {options}
        </Select>
      );
    }

    if (quickGo) {
      if (goButton) {
        gotoButton =
          typeof goButton === 'boolean' ? (
            <button
              type="button"
              onClick={this.go}
              onKeyUp={this.go}
              disabled={disabled}
              className={`${prefixCls}-quick-jumper-button`}
            >
              {locale.jump_to_confirm}
            </button>
          ) : (
            <span onClick={this.go} onKeyUp={this.go}>
              {goButton}
            </span>
          );
      }
      goInput = (
        <div className={`${prefixCls}-quick-jumper`}>
          {locale.jump_to}
          <input
            disabled={disabled}
            type="text"
            value={goInputText}
            onChange={this.handleChange}
            onKeyUp={this.go}
            onBlur={this.handleBlur}
            aria-label={locale.page}
          />
          {locale.page}
          {gotoButton}
        </div>
      );
    }

    return (
      <li className={`${prefixCls}`}>
        {changeSelect}
        {goInput}
      </li>
    );
  }
}

export default Options;
