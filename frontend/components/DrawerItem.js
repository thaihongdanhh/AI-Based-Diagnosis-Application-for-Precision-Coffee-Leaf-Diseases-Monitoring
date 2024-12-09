import { Block, Text, theme } from "galio-framework";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";

import Icon from "./Icon";
import React from "react";
import nowTheme from "../constants/Theme";

class DrawerItem extends React.Component {
  renderIcon = () => {
    const { title, navigateTo, focused } = this.props;

    switch (title) {
      case "HomePage":
        return (
          <Icon
            name="app2x"
            family="NowExtra"
            size={18}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
            style={{ opacity: 0.5 }}
          />
        );
      case "Farm Management":
        return (
          <Icon
            name="atom2x"
            family="NowExtra"
            size={18}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
            style={{ opacity: 0.5 }}
          />
        );
      case "Diagnose":
        return (
          <Icon
            name="paper"
            family="NowExtra"
            size={18}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
            style={{ opacity: 0.5 }}
          />
        );
      case "Nursury Plants":
        return (
          <Icon
            name="profile-circle"
            family="NowExtra"
            size={18}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
            style={{ opacity: 0.5 }}
          />
        );
      case "Weather":
        return (
          <Icon
            name="badge2x"
            family="NowExtra"
            size={18}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
            style={{ opacity: 0.5 }}
          />
        );
      case "Tracking":
        return (
          <Icon
            name="settings-gear-642x"
            family="NowExtra"
            size={18}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
            style={{ opacity: 0.5 }}
          />
        );
      case "Doctor Online":
        return (
          <Icon
            name="album"
            family="NowExtra"
            size={14}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
          />
        );
      case "Other":
        return (
          <Icon
            name="spaceship2x"
            family="NowExtra"
            size={18}
            style={{ borderColor: "rgba(0,0,0,0.5)", opacity: 0.5 }}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
          />
        );
      case "Logout":
        return (
          <Icon
            name="share"
            family="NowExtra"
            size={18}
            style={{ borderColor: "rgba(0,0,0,0.5)", opacity: 0.5 }}
            color={focused ? nowTheme.COLORS.WHITE : "#42a21b"}
          />
        );
      default:
        return null;
    }
  };

  render() {
    const { focused, title, navigateTo, navigation } = this.props;

    const containerStyles = [
      styles.defaultStyle,
      focused ? [styles.activeStyle, styles.shadow] : null,
    ];

    return (
      <TouchableOpacity
        style={{ height: 60 }}
        onPress={() =>
          title == "GETTING STARTED"
            ? Linking.openURL(
                "https://demos.creative-tim.com/now-ui-pro-react-native/docs/"
              ).catch((err) => console.error("An error occurred", err))
            : navigation.navigate(title == "LOGOUT" ? "Onboarding" : navigateTo)
        }
      >
        <Block flex row style={containerStyles}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            {this.renderIcon()}
          </Block>
          <Block row center flex={0.9}>
            <Text
              style={{
                fontFamily: "montserrat-regular",
                textTransform: "uppercase",
                fontWeight: "300",
              }}
              size={12}
              bold={focused ? true : false}
              color={focused ? nowTheme.COLORS.WHITE : "black"}
            >
              {title}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    color: "#42a21b",
  },
  activeStyle: {
    // backgroundColor: nowTheme.COLORS.WHITE,
    backgroundColor: "#42a21b",
    borderRadius: 30,
    color: "#42a21b",
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
  },
});

export default DrawerItem;
