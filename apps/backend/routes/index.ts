
import express from "express";

import issueRoutes from "./issue";
import boardRoutes from "./board";
import sectionRoutes from "./section";
import commentRoutes from "./comment";
import userRoutes from "./user";
import membershipRoutes from "./membership";
import organisationRoutes from "./organisation";

const router = express.Router();

router.use("/issue", issueRoutes);
router.use("/board", boardRoutes);
router.use("/section", sectionRoutes);
router.use("/comment", commentRoutes);
router.use("/user", userRoutes);
router.use("/membership", membershipRoutes);
router.use("/organisation", organisationRoutes);

export default router;