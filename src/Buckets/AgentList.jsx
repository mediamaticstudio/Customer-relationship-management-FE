import React from 'react'
import Select from "react-select";


export const AgentList = ({ agents, assigning, selectedLeads, handleBulkAssign }) => {
  const agentOptions = agents.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  return (
    <div>
      <Select
        options={agentOptions}
        placeholder={assigning ? "Assigning..." : "Assign selected to"}
        isDisabled={assigning || selectedLeads.length === 0}
        onChange={(selected) => handleBulkAssign(selected.value)}
        isSearchable
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: "38px",
            minWidth: "240px",
            backgroundColor: "var(--input-bg)",
            borderColor: state.isFocused ? "var(--primary-mid)" : "var(--border-soft)",
            borderRadius: "8px",
            boxShadow: "none",
            cursor: "pointer",
            fontSize: "14px",
            "&:hover": {
              borderColor: "var(--primary-mid)",
            },
          }),

          placeholder: (base) => ({
            ...base,
            color: "var(--text-muted-dark)",
            fontWeight: 500,
          }),

          singleValue: (base) => ({
            ...base,
            color: "var(--text-dark)",
            fontWeight: 500,
          }),

          menu: (base) => ({
            ...base,
            backgroundColor: "var(--card-bg)",
            borderRadius: "8px",
            boxShadow: "var(--shadow-medium)",
            border: "1px solid var(--border-soft)",
            marginTop: "4px",
            fontSize: "14px",
            zIndex: 100,
          }),

          option: (base, state) => ({
            ...base,
            padding: "10px 14px",
            backgroundColor: state.isSelected
              ? "var(--primary-mid)"
              : state.isFocused
                ? "rgba(148, 163, 184, 0.1)"
                : "transparent",
            color: state.isSelected ? "white" : "var(--text-dark)",
            cursor: "pointer",
          }),

          indicatorSeparator: () => ({
            display: "none",
          }),

          dropdownIndicator: (base) => ({
            ...base,
            color: "var(--primary-mid)",
            "&:hover": {
              color: "var(--primary-dark)",
            },
          }),
          input: (base) => ({
            ...base,
            color: "var(--text-dark)",
          }),
        }}
      />
    </div>
  )
}
