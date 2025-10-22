{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bun2nix = {
      url = "github:baileyluTCD/bun2nix";
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
        pkgs = import nixpkgs { inherit system; };
      in
      {
        packages.default = bun2nix.lib.${system}.mkBunDerivation {
          packageJson = ./package.json;
          src = ./.;
          bunNix = (
            pkgs.runCommand "bun.nix" { } ''
              ${bun2nix.packages.${system}.default}/bin/bun2nix -l ${./bun.lock} -o $out
            ''
          );
          buildPhase = ''
            bun run build
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
