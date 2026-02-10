import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { SiteManagementService } from "./siteManagement.services";

const uploadCoverImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { urls, idNo } = req.body;
    const result = await SiteManagementService.uploadCoverImages({
      urls,
      idNo,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Banner created successfully",
      data: result,
    });
  },
);

const getBanners = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sortBy = (req.query?.sortBy as string) || "order";
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;

    const result = await SiteManagementService.getBanners(sortBy, sortWith);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Banners fetched successfully",
      data: result,
    });
  },
);
const getPortfolio = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    // const sortBy = (req.query?.sortBy as string) || "order";
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 12;
    // const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;
    const tabId = req.query?.tabId as string;

    const result = await SiteManagementService.getPortfolio(idNo,page,limit,tabId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Portfolio fetched successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   DELETE SINGLE BANNER (Admin)
------------------------------------- */
const deleteCoverPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { imageId, id } = req.params;
    const result = await SiteManagementService.deleteCoverPhoto(imageId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cover photo deleted successfully",
      data: result,
    });
  },
);
const deleteProfilePerformance = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { imageId, id } = req.params;
    const result = await SiteManagementService.deleteProfilePerformance(
      imageId,
      id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile performance deleted successfully",
      data: result,
    });
  },
);
const deleteProfileMediaArchives = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { imageId, id } = req.params;
    const result = await SiteManagementService.deleteProfileMediaArchives(
      imageId,
      id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile media archives deleted successfully",
      data: result,
    });
  },
);
const deleteProfileNews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newsId, id } = req.params;
    const result = await SiteManagementService.deleteProfileNews(newsId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile news deleted successfully",
      data: result,
    });
  },
);
const deleteTab = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tabId, id } = req.params;
    const result = await SiteManagementService.deleteTab(tabId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Portfolio news deleted successfully",
      data: result,
    });
  },
);
const deleteWork = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tabId, workId, id } = req.params;
    const result = await SiteManagementService.deleteWork(tabId, workId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile news deleted successfully",
      data: result,
    });
  },
);
const updateProfileAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    const { profileData } = req.body;
    const result = await SiteManagementService.updateProfileAbout(
      profileData,
      idNo,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  },
);
const addProfilePerformance = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    const result = await SiteManagementService.addProfilePerformance(
      req.body,
      idNo,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Performance added successfully",
      data: result,
    });
  },
);
const addProfileMediaArchives = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    const result = await SiteManagementService.addProfileMediaArchives(
      req.body,
      idNo,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Media archives added successfully",
      data: result,
    });
  },
);
const addProfileNews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await SiteManagementService.addProfileNews(payload, idNo);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "News added successfully",
      data: result,
    });
  },
);
const editProfileNews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await SiteManagementService.editProfileNews(payload, idNo);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "News edited successfully",
      data: result,
    });
  },
);
const createTabs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await SiteManagementService.createTabs(payload, idNo);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "News edited successfully",
      data: result,
    });
  },
);
const uploadWork = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await SiteManagementService.uploadWorks(payload, idNo);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "News edited successfully",
      data: result,
    });
  },
);

export const SiteManagementController = {
  uploadCoverImages,
  getBanners,
  deleteCoverPhoto,
  updateProfileAbout,
  addProfilePerformance,
  deleteProfilePerformance,
  addProfileMediaArchives,
  deleteProfileMediaArchives,
  addProfileNews,
  deleteProfileNews,
  editProfileNews,
  createTabs,
  uploadWork,
  getPortfolio,
  deleteWork,
  deleteTab,
};
