import { useState } from "react";
import {
  ThemeProvider,
  ShellBar,
  Button,
  Text,
  Avatar,
} from "@ui5/webcomponents-react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider>
      <ShellBar
        logo={
          <img
            alt="UI5 Logo"
            src="https://sdk.openui5.org/resources/sap/ui/documentation/sdk/images/logo_ui5.png"
          />
        }
        primaryTitle="SAP UI Frameworks for Enterprise Developers: A Practical Guide"
        secondaryTitle="UI5 Web Components for React"
        showNotifications
        notificationsCount="60"
        profile={<Avatar initials="MV" />}
        showProductSwitch
      />
      <Text>Current count: {count}</Text>
      <Button
        icon="add"
        onClick={function () {
          setCount(count + 1);
        }}
      >
        Click to increase the counter
      </Button>
    </ThemeProvider>
  );
}

export default App;
