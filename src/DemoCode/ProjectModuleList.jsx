import React, { useState, useMemo } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { FixedSizeList } from "react-window"; // Virtualization for large lists

const customerList = Array.from({ length: 700 }, (_, index) => ({
  Master_Name: `Customer ${index + 1}`,
  CustomerId: 11530 + index,
  CustomerCode: String(1000 + index),
  SaleRepId: 11475,
  SalesRepCode: `SKM${index}`,
}));

const AutoCompleteStyles = { minWidth: "200px" };

// Custom Listbox for virtualization
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemCount = Array.isArray(children) ? children.length : 0;
  const itemSize = 36; // Height of each item

  return (
    <div ref={ref} {...other}>
      <FixedSizeList height="max-content" width="100%" itemSize={itemSize} itemCount={itemCount} overscanCount={5}>
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </FixedSizeList>
    </div>
  );
});

const CustomerAutocomplete = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  // Efficient filtering using useMemo
  const filteredCustomers = useMemo(() => {
    if (!searchValue) return customerList;
    return customerList.filter((customer) =>
      customer.CustomerCode.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  return (
    <Autocomplete
      size="small"
      options={filteredCustomers}
      sx={{ minWidth: "200px" }}
      getOptionLabel={(option) => option.CustomerCode}
      renderInput={(params) => (
        <TextField
          {...params}
          sx={AutoCompleteStyles}
          placeholder="Select Customer"
          variant="outlined"
          onChange={(e) => setSearchValue(e.target.value)} // Optimize filtering
        />
      )}
      ListboxComponent={ListboxComponent} // Virtualized List
      onChange={(event, newValue) => setSelectedCustomer(newValue)}
      isOptionEqualToValue={(option, value) => option.CustomerId === value.CustomerId}
    />
  );
};

export default CustomerAutocomplete;
