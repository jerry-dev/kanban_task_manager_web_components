import Navigo from "./es/index.js";

const resolvingOptions = {
	hash: true,
	strategy: "ONE"
};

const router = new Navigo("/", resolvingOptions);

export default router;