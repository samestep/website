{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bun2nix = {
      url = "github:fleek-platform/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      bun2nix,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ bun2nix.overlays.default ];
        };
      in
      {
        packages.default = pkgs.bun2nix.mkDerivation {
          packageJson = ./package.json;
          src = ./.;
          bunDeps = pkgs.bun2nix.fetchBunDeps {
            bunNix = (
              pkgs.runCommand "bun.nix" { } ''
                ${pkgs.bun2nix}/bin/bun2nix -l ${./bun.lock} -o $out
              ''
            );
          };
          bunInstallFlags = [ "--backend=copyfile" ]; # Necessary on Mac.
          buildPhase = ''
            bun run build
          '';
          doCheck = true;
          checkPhase = ''
            bun run check
          '';
          installPhase = ''
            mv dist $out
          '';
        };
        devShells.default = pkgs.mkShellNoCC {
          buildInputs = [
            pkgs.bun
            pkgs.nixfmt
          ];
        };
      }
    );
}
