import { ThemingProps } from "@chakra-ui/styled-system";
import { ThemeExtension } from "./extend-theme";
export declare function withDefaultSize({ size, components, }: {
    size: ThemingProps["size"];
    components?: string[] | Record<string, any>;
}): ThemeExtension;
