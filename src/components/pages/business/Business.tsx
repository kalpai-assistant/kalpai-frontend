import {
  AppShell,
  Burger,
  Button,
  Flex,
  NavLink,
  ScrollArea,
  Title,
  Modal,
  Group,
  Tooltip,
  UnstyledButton,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import styles from "./Business.module.scss";
import { useEffect, useState } from "react";
import { IconChevronRight, IconLogout } from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { unsetLocalStorage } from "../../../utils/utils";
import { NavbarConfigMap } from "../../../utils/constants";
import { FaAngleRight } from "react-icons/fa";

const Business: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure();
  const [logoutModal, { open: openLogout, close: closeLogout }] =
    useDisclosure();

  const [activeComponent, setActiveComponent] = useState<string>("");

  useEffect(() => {
    // Match the pathname with the component names
    const matchedComponent = Object.keys(NavbarConfigMap).find(
      (key) => NavbarConfigMap[key].path === location.pathname,
    );

    setActiveComponent(matchedComponent || ""); // Default to an empty string if no match
  }, [location.pathname]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleNavSelection = (optionName: string) => {
    setActiveComponent(optionName);
    navigate(NavbarConfigMap[optionName].path);

    if (isMobile) {
      toggle();
    }
  };

  const handleLogout = () => {
    unsetLocalStorage();
    navigate("/login");
  };

  return (
    <AppShell
      navbar={{
        width: opened
          ? { base: 150, sm: 200, lg: 200 }
          : { base: 0, sm: 70, lg: 70 },
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
      className={styles.businessAppShell}
    >
      <AppShell.Navbar pb="lg" bg="#f4f4f4" className={styles.navbar}>
        {opened ? (
          // Full sidebar
          <>
            <AppShell.Section>
              <Flex p="md" align="center" justify="flex-start" gap="md">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  size="md"
                  className={styles.burger}
                />
                <Title order={2}>Kalp AI</Title>
              </Flex>
            </AppShell.Section>
            <AppShell.Section grow component={ScrollArea}>
              {Object.keys(NavbarConfigMap).map((key) => {
                const config = NavbarConfigMap[key];
                const IconComponent = config.icon;
                return (
                  <NavLink
                    key={key}
                    label={key}
                    onClick={() => handleNavSelection(key)}
                    leftSection={<IconComponent size="1.2rem" />}
                    rightSection={
                      <IconChevronRight
                        size="0.8rem"
                        stroke={1.5}
                        className="mantine-rotate-rtl"
                      />
                    }
                    variant={activeComponent === key ? "white" : "subtle"}
                    active={activeComponent === key}
                    color="black"
                  />
                );
              })}
            </AppShell.Section>
            <AppShell.Section p="xs">
              <Button
                onClick={openLogout}
                c="red"
                variant="outline"
                color="red"
                leftSection={<IconLogout size="1rem" />}
              >
                Logout
              </Button>
            </AppShell.Section>
          </>
        ) : (
          // Mini sidebar
          <>
            <AppShell.Section>
              <Flex p="sm" align="center" justify="center">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  size="md"
                  className={styles.burger}
                />
              </Flex>
            </AppShell.Section>
            <AppShell.Section grow component={ScrollArea}>
              <Flex direction="column" gap="xs" p="xs">
                {Object.keys(NavbarConfigMap).map((key) => {
                  const config = NavbarConfigMap[key];
                  const IconComponent = config.icon;
                  return (
                    <Tooltip key={key} label={key} position="right" withArrow>
                      <UnstyledButton
                        onClick={() => handleNavSelection(key)}
                        className={styles.miniNavItem}
                        data-active={activeComponent === key}
                      >
                        <Flex direction="column" align="center" gap="xs">
                          <IconComponent size="1.4rem" />
                        </Flex>
                      </UnstyledButton>
                    </Tooltip>
                  );
                })}
              </Flex>
            </AppShell.Section>
            <AppShell.Section p="xs">
              <Flex direction="column" align="center" gap="xs">
                <ActionIcon
                  onClick={toggle}
                  size="xl"
                  radius="xl"
                  className={styles.reopenIcon}
                  variant="filled"
                  color="gray"
                >
                  <FaAngleRight size="1.5rem" />
                </ActionIcon>
              </Flex>
            </AppShell.Section>
          </>
        )}
      </AppShell.Navbar>
      <Modal
        opened={logoutModal}
        onClose={closeLogout}
        title="Are you sure?"
        zIndex={1000}
        transitionProps={{
          transition: "slide-up",
          duration: 500,
          timingFunction: "ease",
        }}
      >
        <Group justify="space-between" m="xs">
          <Button onClick={handleLogout} variant="outline" color="red">
            Logout
          </Button>
          <Button onClick={closeLogout}>Stay</Button>
        </Group>
      </Modal>

      <AppShell.Main bg={NavbarConfigMap[activeComponent]?.bgColor}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Business;
